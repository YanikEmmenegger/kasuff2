import {OperationResult} from "../types";
import Game, {IAnswer, ICodeBreakerGame, IGame, IMiniGame, IPunishment, IWordScrambleGame} from "../models/Game";
import {
    ICleanedQuestion,
    ICleanRankingQuestion,
    ICleanSpyQuestion,
    ICleanWhoWouldRatherQuestion,
    IMultipleChoiceQuestion,
    IRankingQuestion,
    IWhatWouldYouRatherQuestion
} from "../models/Question";
import {getQuestionById} from "./questionController";
import {Schema} from "mongoose";

/**
 * Utility class to manage punishments
 */
class PunishmentManager {
    private punishmentsMap: Map<string, IPunishment> = new Map();

    addPunishment(playerId: string | Schema.Types.ObjectId, newPunishment: Partial<IPunishment>) {
        const key = playerId.toString();
        if (this.punishmentsMap.has(key)) {
            const existingPunishment = this.punishmentsMap.get(key)!;
            if (newPunishment.reasons) {
                existingPunishment.reasons.push(...newPunishment.reasons);
            }
            if (typeof newPunishment.give === 'number') {
                existingPunishment.give = (existingPunishment.give || 0) + newPunishment.give;
            }
            if (typeof newPunishment.take === 'number') {
                existingPunishment.take = (existingPunishment.take || 0) + newPunishment.take;
            }
        } else {
            this.punishmentsMap.set(key, {
                playerId: (key as unknown as Schema.Types.ObjectId),
                reasons: newPunishment.reasons || [],
                give: newPunishment.give || 0,
                take: newPunishment.take || 0,
            });
        }
    }

    getPunishments(): IPunishment[] {
        return Array.from(this.punishmentsMap.values());
    }
}

/**
 * Fetch active game by code
 */
const getActiveGame = async (gameCode: string): Promise<OperationResult<IGame>> => {
    const game = await Game.findOne({code: gameCode, isActive: true});
    if (!game) {
        return {success: false, error: 'Game not found'};
    }
    return {success: true, data: game};
};

/**
 * Fetch current question data
 */
const getCurrentQuestion = async (game: IGame): Promise<OperationResult<any>> => {
    const currentQuestionId = (game.rounds[game.currentRoundIndex].data as ICleanedQuestion)._id;
    const result = await getQuestionById(currentQuestionId.toString());
    if (!result.success) {
        console.error('Error fetching current question:', result.error);
        return {success: false, error: 'Error fetching current question'};
    }
    return {success: true, data: result.data!};
};

/**
 * Include players who didn't answer
 */
const includePlayersNotAnswered = (
    game: IGame,
    answers: IAnswer[],
    currentQuestionId?: Schema.Types.ObjectId
): IAnswer[] => {
    const playersNotAnswered = game.players
        .filter(p => !game.playersAnswered.includes(p))
        .map(p => ({
            playerId: p,
            questionId: currentQuestionId, // May be undefined for mini-games
            answer: '__NOT_ANSWERED__',
            answeredAt: new Date(),
            isCorrect: false,
            pointsAwarded: 0,
        }));
    return answers.concat(playersNotAnswered);
};

/**
 * Calculate points for Questions
 */
export const calculatePointsForQuestion = async (gameCode: string): Promise<OperationResult<{
    answers: IAnswer[],
    punishments: IPunishment[]
}>> => {
    try {
        const gameResult = await getActiveGame(gameCode);
        if (!gameResult.success) return {success: false, error: gameResult.error};
        const game = gameResult.data!;

        const questionResult = await getCurrentQuestion(game);
        if (!questionResult.success) return {success: false, error: questionResult.error};
        const currentQuestion = questionResult.data!;

        let answers: IAnswer[] = game.answers[game.currentRoundIndex] || [];
        answers = includePlayersNotAnswered(game, answers, (game.rounds[game.currentRoundIndex].data as ICleanedQuestion)._id);

        const multiplier = game.settings.punishmentMultiplier;
        let updatedAnswers: IAnswer[] = [];
        let punishments: IPunishment[] = [];

        switch (currentQuestion.type) {
            case 'multiple-choice':
                ({answers: updatedAnswers, punishments} = handleMultipleChoice(currentQuestion, answers, multiplier));
                break;
            case 'what-would-you-rather':
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleWhatWouldYouRather(currentQuestion, answers, multiplier));
                break;
            case 'who-would-rather':
                const whoWouldRatherQuestion = game.rounds[game.currentRoundIndex].data! as ICleanWhoWouldRatherQuestion;
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleWhoWouldRather(whoWouldRatherQuestion, answers, multiplier));
                break;
            case 'ranking':
                const result = handleRanking(currentQuestion, answers, multiplier);
                updatedAnswers = result.answers;
                punishments = result.punishments;
                const currentRankingQuestion = game.rounds[game.currentRoundIndex].data! as ICleanRankingQuestion;
                currentRankingQuestion.finalRanking = result.finalRanking;
                game.rounds[game.currentRoundIndex].data = currentRankingQuestion;
                game.markModified('rounds');
                await game.save();
                break;
            case 'spy':
                const spyQuestion = game.rounds[game.currentRoundIndex].data! as ICleanSpyQuestion;
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleSpy(spyQuestion, answers, multiplier));
                break;
            default:
                return {success: false, error: 'Unknown Question Type'};
        }

        return {success: true, data: {answers: updatedAnswers, punishments}};
    } catch (e) {
        return {success: false, error: 'Invalid question type @calculatePointsForQuestion'};
    }
};

/**
 * Calculate points for MiniGames
 */
export const calculatePointsForMiniGames = async (gameCode: string): Promise<OperationResult<{
    answers: IAnswer[],
    punishments: IPunishment[]
}>> => {
    try {
        const gameResult = await getActiveGame(gameCode);
        if (!gameResult.success) return {success: false, error: gameResult.error};
        const game = gameResult.data!;

        let answers: IAnswer[] = game.answers[game.currentRoundIndex] || [];
        const currentMiniGame = game.rounds[game.currentRoundIndex].data as IMiniGame;
        answers = includePlayersNotAnswered(game, answers); // No questionId for mini-games

        const multiplier = game.settings.punishmentMultiplier;
        let updatedAnswers: IAnswer[] = [];
        let punishments: IPunishment[] = [];

        const timerFinishedAt = game.timeRemaining;
        const timeLimit = game.settings.timeLimit;

        switch (currentMiniGame.type) {
            case "hide-and-seek":
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleHideAndSeek(answers, multiplier, timerFinishedAt, timeLimit));
                break;
            case "memory":
            case "sequence-memory":
                ({answers: updatedAnswers, punishments} = handleMemory(answers, multiplier));
                break;
            case "word-scramble":
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleWordScramble(currentMiniGame as IWordScrambleGame, answers, multiplier))
                break;
            case "code-breaker":
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleCodeBreaker(currentMiniGame as ICodeBreakerGame, answers, multiplier))
                break
            default:
                console.log('Unknown MiniGame Type');
                console.log(currentMiniGame);
                console.log(game.answers[game.currentRoundIndex]);
                return {success: false, error: 'Unknown MiniGame Type'};
        }
        return {success: true, data: {answers: updatedAnswers, punishments}};
    } catch (e) {
        console.log(e);
        return {success: false, error: 'Invalid mini game type @calculatePointsForMiniGames'};
    }
};

/**
 * Handle Memory and Sequence Memory mini games
 */
const handleMemory = (
    answers: IAnswer[],
    multiplier: number,
): { answers: IAnswer[]; punishments: IPunishment[] } => {
    const punishmentManager = new PunishmentManager();
    let noAnswerCount = 0;
    const correctAnswers: Schema.Types.ObjectId[] = [];

    answers.forEach((answer) => {
        answer.pointsAwarded = 0;

        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            noAnswerCount++;
            answer.pointsAwarded = -300;
            punishmentManager.addPunishment(answer.playerId, {
                reasons: [`Didn't solve in time 😢 ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        } else {
            answer.pointsAwarded = 100;
            correctAnswers.push(answer.playerId);
            if (typeof answer.answer === 'number') {
                if (answer.answer === 0) {
                    answer.pointsAwarded += 100;
                }
                if (answer.answer < 5) {
                    answer.pointsAwarded += 50;
                }
                if (answer.answer > 10) {
                    answer.pointsAwarded -= 50;
                }
            }
        }
    });

    if (noAnswerCount === 0 && correctAnswers.length > 0) {
        punishmentManager.addPunishment(correctAnswers[0], {
            reasons: [`You were the fastest ⚡️ Give ${multiplier} sips`],
            give: multiplier
        });
    }
    if (noAnswerCount === answers.length) {
        answers.forEach((answer) => {
            punishmentManager.addPunishment(answer.playerId, {
                reasons: [`No one answered 🤷🏻‍♂️ take ${multiplier} sips`],
                take: multiplier
            });
        });
    }
    if (correctAnswers.length === 1) {
        punishmentManager.addPunishment(correctAnswers[0], {
            reasons: [`You were the only one who solved it 🥳 Give ${2 * multiplier} sips`],
            give: 2 * multiplier
        });
    }

    return {answers, punishments: punishmentManager.getPunishments()};
};

/**
 * Handle Hide-and-Seek mini game
 */
const handleHideAndSeek = (
    answers: IAnswer[],
    multiplier: number,
    timerFinishedAt: Date,
    timeLimit: number
): { answers: IAnswer[]; punishments: IPunishment[] } => {
    const punishmentManager = new PunishmentManager();
    const answeredAnswers = answers.filter(
        (answer): answer is IAnswer & { answer: number } =>
            typeof answer.answer === 'number'
    );
    const notAnswered = answers.filter(
        (answer) => answer.answer === '__NOT_ANSWERED__'
    );
    const sortedAnswers = answeredAnswers.sort(
        (a, b) =>
            new Date(a.answeredAt!).getTime() -
            new Date(b.answeredAt!).getTime()
    );
    const totalPlayers = answers.length;

    const firstTryPlayers: (string | Schema.Types.ObjectId)[] = [];
    const tooManyTriesPlayers: (string | Schema.Types.ObjectId)[] = [];
    const fastPlayers: (string | Schema.Types.ObjectId)[] = [];
    const slowPlayers: (string | Schema.Types.ObjectId)[] = [];
    const noAnswerPlayers: (string | Schema.Types.ObjectId)[] = [];

    sortedAnswers.forEach((answer, index) => {
        const answeredAtTime = new Date(answer.answeredAt!).getTime();
        const timerFinishedTime = timerFinishedAt.getTime();
        const timeDifference =
            ((timerFinishedTime - answeredAtTime) / 1000 - timeLimit) * -1;
        let points = 100;
        const bonusPoints = (totalPlayers - index) * 10;
        points += bonusPoints;

        if (answer.answer === 1) {
            firstTryPlayers.push(answer.playerId);
            points += 50;
        }
        if (answer.answer > 15) {
            tooManyTriesPlayers.push(answer.playerId);
            points -= 50;
        }
        if (answer.answer > 5) {
            points -= 10;
        }

        if (timeDifference < 3) {
            fastPlayers.push(answer.playerId);
            points += 20;
        }
        if (timeDifference >= 3 && timeDifference < 10) {
            points += 10;
        }
        if (timeDifference >= 10 && timeDifference < 20) {
            slowPlayers.push(answer.playerId);
            points -= 10;
        }
        answer.pointsAwarded = points;
    });

    notAnswered.forEach((answer) => {
        answer.pointsAwarded = -300;
        noAnswerPlayers.push(answer.playerId);
    });

    firstTryPlayers.forEach((playerId) => {
        punishmentManager.addPunishment(playerId, {
            reasons: [`You got it on the first try!`],
        });
    });

    tooManyTriesPlayers.forEach((playerId) => {
        punishmentManager.addPunishment(playerId, {
            reasons: [`You tried too many times! Take ${multiplier} sips`],
            take: multiplier,
        });
    });

    fastPlayers.forEach((playerId) => {
        punishmentManager.addPunishment(playerId, {
            reasons: [`You were fast! Give ${multiplier} sips`],
            give: multiplier,
        });
    });

    slowPlayers.forEach((playerId) => {
        punishmentManager.addPunishment(playerId, {
            reasons: [`You were slow! Take ${multiplier} sips`],
            take: multiplier,
        });
    });

    noAnswerPlayers.forEach((playerId) => {
        punishmentManager.addPunishment(playerId, {
            reasons: [`Didn't answer (or too late) – drink ${3 * multiplier} sips`],
            take: 3 * multiplier,
        });
    });

    if (firstTryPlayers.length === 1) {
        const playerId = firstTryPlayers[0];
        punishmentManager.addPunishment(playerId, {
            reasons: [`Only one on First Try! Give ${2 * multiplier} sips`],
            give: 2 * multiplier,
        });
    }

    if (tooManyTriesPlayers.length === 1 && noAnswerPlayers.length === 0) {
        const playerId = tooManyTriesPlayers[0];
        punishmentManager.addPunishment(playerId, {
            reasons: [`Only one tried too many times! Take ${multiplier} sips`],
            take: multiplier,
        });
    }

    if (fastPlayers.length === 1) {
        const playerId = fastPlayers[0];
        punishmentManager.addPunishment(playerId, {
            reasons: [`You were the only fast! Give ${multiplier} sips`],
            give: multiplier,
        });
    }

    if (slowPlayers.length === 1 && noAnswerPlayers.length === 0) {
        const playerId = slowPlayers[0];
        punishmentManager.addPunishment(playerId, {
            reasons: [`You were slow! Take ${multiplier} sips`],
            take: multiplier,
        });
    }

    if (noAnswerPlayers.length === 1) {
        const playerId = noAnswerPlayers[0];
        punishmentManager.addPunishment(playerId, {
            reasons: [`Only you didn't finish 🫠 - take ${3 * multiplier} sips`],
            take: 3 * multiplier,
        });
    }

    return {answers, punishments: punishmentManager.getPunishments()};
};

/**
 * Handle Ranking question
 */
const handleRanking = (
    question: IRankingQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[], finalRanking: string[] } => {
    const punishmentManager = new PunishmentManager();
    const noAnswerPlayers: IPunishment[] = [];
    const rankingMap: Map<string, number> = new Map();

    answers.forEach(answer => {
        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            answer.pointsAwarded = -300;
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        } else {
            if (typeof answer.answer !== "number") {
                const rankedPlayers = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
                rankedPlayers.forEach((playerId, rankIndex) => {
                    const key = playerId.toString();
                    const currentRank = rankingMap.get(key) || 0;
                    rankingMap.set(key, currentRank + rankIndex + 1);
                });
            }
        }
    });

    const finalRanking = Array.from(rankingMap.entries())
        .map(([playerId, rankPoints]) => ({playerId, rankPoints}))
        .sort((a, b) => a.rankPoints - b.rankPoints);

    const maxDeviation = finalRanking.length * (finalRanking.length - 1) / 2;

    answers.forEach(answer => {
        if (answer.answer && answer.answer !== "__NOT_ANSWERED__") {
            const playerRanking = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
            let deviation = 0;
            playerRanking.forEach((playerId, index) => {
                const finalRank = finalRanking.findIndex(r => r.playerId === playerId.toString());
                deviation += Math.abs(index - finalRank);
            });
            const score = Math.max(0, 500 - Math.floor((deviation / maxDeviation) * 500));
            answer.pointsAwarded = score;

            if (score === 500) {
                punishmentManager.addPunishment(answer.playerId, {
                    give: 2 * multiplier,
                    reasons: [`Perfection 🤩 – give ${2 * multiplier} sips!`]
                });
            } else if (score >= 400) {
                punishmentManager.addPunishment(answer.playerId, {
                    give: multiplier,
                    reasons: [`Close to Perfection ☺️ – give ${multiplier} sips!`]
                });
            } else if (score >= 200) {
                punishmentManager.addPunishment(answer.playerId, {
                    take: multiplier,
                    reasons: [`Not so good 🤨 – take ${multiplier} sips!`]
                });
            } else if (score >= 1) {
                punishmentManager.addPunishment(answer.playerId, {
                    take: 2 * multiplier,
                    reasons: [`Bad Ranking ☹️ – take ${2 * multiplier} sips!`]
                });
            } else {
                punishmentManager.addPunishment(answer.playerId, {
                    take: 3 * multiplier,
                    reasons: [`FOR REAL 😂 – take ${3 * multiplier} sips!`]
                });
            }
        }
    });

    const adjustmentFactor = 100;
    const sortedFinalRanking = finalRanking.sort((a, b) => a.rankPoints - b.rankPoints);

    sortedFinalRanking.forEach((rank, index) => {
        const player = answers.find(answer => answer.playerId.toString() === rank.playerId);
        if (!player) return;
        const adjustment = adjustmentFactor * (sortedFinalRanking.length - index - 1);

        if (question.goodOrBad === 'good') {
            player.pointsAwarded! += adjustment;
            if (index === 0) {
                punishmentManager.addPunishment(rank.playerId, {
                    give: 3 * multiplier,
                    reasons: [`You've been ranked #1 😇 – give ${3 * multiplier} sips!`]
                });
            } else if (index === 1) {
                punishmentManager.addPunishment(rank.playerId, {
                    give: 2 * multiplier,
                    reasons: [`You've been ranked #2 ☺️ – give ${2 * multiplier} sips!`]
                });
            } else if (index === 2) {
                punishmentManager.addPunishment(rank.playerId, {
                    give: multiplier,
                    reasons: [`You've been ranked #3 👏🏼 – give ${multiplier} sips!`]
                });
            }
        } else if (question.goodOrBad === 'bad') {
            player.pointsAwarded! -= adjustment;
            if (index === 0) {
                punishmentManager.addPunishment(rank.playerId, {
                    take: 3 * multiplier,
                    reasons: [`You've been ranked #1 🫣🫵 – take ${3 * multiplier} sips!`]
                });
            } else if (index === 1) {
                punishmentManager.addPunishment(rank.playerId, {
                    take: 2 * multiplier,
                    reasons: [`You've been ranked #2 🤨🫵 – take ${2 * multiplier} sips!`]
                });
            } else if (index === 2) {
                punishmentManager.addPunishment(rank.playerId, {
                    take: multiplier,
                    reasons: [`You've been ranked #3 🫠🫵 – take ${multiplier} sips!`]
                });
            }
        }
    });

    const finalRankingArray = sortedFinalRanking.map((rank) => rank.playerId);

    return {
        answers,
        punishments: [...punishmentManager.getPunishments(), ...noAnswerPlayers],
        finalRanking: finalRankingArray
    };
};

/**
 * Handle Multiple-Choice question
 */
const handleMultipleChoice = (
    question: IMultipleChoiceQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    //const punishmentManager = new PunishmentManager();
    const correctAnswer = question.options[question.correctOptionIndex];

    answers.sort((a, b) => new Date(a.answeredAt!).getTime() - new Date(b.answeredAt!).getTime());

    const bonusPoints = [50, 25, 10];
    let correctAnswersCount = 0;
    let noAnswerCount = 0;
    let wrongAnswersCount = 0;

    const correctAnswerPlayers: IPunishment[] = [];
    const wrongAnswerPlayers: IPunishment[] = [];
    const noAnswerPlayers: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.isCorrect = false;
        answer.pointsAwarded = 0;

        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            noAnswerCount++;
            answer.pointsAwarded = -300;
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        } else if (answer.answer === correctAnswer) {
            answer.isCorrect = true;
            answer.pointsAwarded = 100;
            if (correctAnswersCount < 3) {
                answer.pointsAwarded += bonusPoints[correctAnswersCount];
            }
            correctAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: []
            });
            correctAnswersCount++;
        } else {
            wrongAnswersCount++;
            answer.pointsAwarded = -100;
            wrongAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Answered incorrectly – drink ${multiplier} sip(s)`],
                take: multiplier
            });
        }
    });

    if (correctAnswersCount === 0) {
        noAnswerPlayers.forEach(player => {
            player.take = 3 * multiplier;
            player.reasons.push(`Everyone answered wrong – drink ${3 * multiplier} sips`);
        });
        wrongAnswerPlayers.forEach(player => {
            player.take = 3 * multiplier;
            player.reasons.push(`Everyone answered wrong – drink ${3 * multiplier} sips`);
        });
    }

    if (correctAnswerPlayers.length === 1) {
        correctAnswerPlayers[0].give = 2 * multiplier;
        correctAnswerPlayers[0].reasons.push(`Only correct answer – give ${2 * multiplier} sip(s)`);
    }

    if (noAnswerCount === 1) {
        noAnswerPlayers[0].take! += 2 * multiplier;
        noAnswerPlayers[0].reasons.push(`Only player who didn't answer – drink ${2 * multiplier} extra sips`);
    }

    if (wrongAnswersCount === 1 && noAnswerCount === 0) {
        wrongAnswerPlayers[0].take! += multiplier;
        wrongAnswerPlayers[0].reasons.push(`Only player who answered wrong – drink ${multiplier} extra sip(s)`);
    }

    if (noAnswerCount === 0 && wrongAnswersCount === 0 && correctAnswerPlayers.length > 0) {
        correctAnswerPlayers[0].give = multiplier;
        correctAnswerPlayers[0].reasons.push(`Fastest 🚀 – give ${multiplier} sip(s)`);
    }

    if (noAnswerCount === 0 && correctAnswersCount === 0 && wrongAnswerPlayers.length > 0) {
        wrongAnswerPlayers[wrongAnswerPlayers.length - 1].take! += multiplier;
        wrongAnswerPlayers[wrongAnswerPlayers.length - 1].reasons!.push(`Slowest and wrong 🐢 – drink ${multiplier} extra sip(s)`);
    }

    const correctAnswerPunishments = correctAnswerPlayers.map((player, index) => ({
        playerId: player.playerId,
        reasons: [...(player.reasons || []), `Answered correctly as #${index + 1}`],
        give: player.give || undefined,
    }));

    const punishments = [...noAnswerPlayers, ...wrongAnswerPlayers, ...correctAnswerPunishments];

    return {answers, punishments};
};

/**
 * Handle What Would You Rather question
 */
const handleWhatWouldYouRather = (
    question: IWhatWouldYouRatherQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    const punishmentManager = new PunishmentManager();
    const option1 = question.options[0];
    const option2 = question.options[1];

    let option1Votes = 0;
    let option2Votes = 0;
    let noAnswerCount = 0;

    const option1Players: IPunishment[] = [];
    const option2Players: IPunishment[] = [];
    const noAnswerPlayers: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.pointsAwarded = 0;

        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            noAnswerCount++;
            answer.pointsAwarded = -300;
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer 🤦🏻‍♂️ ${2 * multiplier}`],
                take: 2 * multiplier
            });
        } else if (answer.answer === option1) {
            option1Votes++;
            option1Players.push({
                playerId: answer.playerId,
                reasons: [],
            });
        } else if (answer.answer === option2) {
            option2Votes++;
            option2Players.push({
                playerId: answer.playerId,
                reasons: [],
            });
        }
    });

    const totalVotes = option1Votes + option2Votes;
    const isTie = option1Votes === option2Votes && totalVotes > 0;

    if (!isTie && totalVotes > 0) {
        const majorityPlayers = option1Votes > option2Votes ? option1Players : option2Players;
        majorityPlayers.forEach((player) => {
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) {
                answer.pointsAwarded = 100 * multiplier;
            }
        });
    }

    if (isTie) {
        const tiedPlayers = [...option1Players, ...option2Players];
        tiedPlayers.forEach((player) => {
            punishmentManager.addPunishment(player.playerId, {
                reasons: [`Tie – drink ${multiplier} sip(s) each! 🍻`],
                take: multiplier
            });
        });
    } else {
        const majorityPlayers = option1Votes > option2Votes ? option1Players : option2Players;
        const minorityPlayers = option1Votes > option2Votes ? option2Players : option1Players;

        majorityPlayers.forEach((player, index) => {
            player.reasons.push(`In the majority (#${index + 1})`);
            punishmentManager.addPunishment(player.playerId, {
                reasons: player.reasons
            });
        });

        minorityPlayers.forEach((player) => {
            punishmentManager.addPunishment(player.playerId, {
                reasons: [`In the minority – drink ${2 * multiplier} sip(s) 🍷`],
                take: 2 * multiplier
            });
        });

        if (minorityPlayers.length === 1) {
            punishmentManager.addPunishment(minorityPlayers[0].playerId, {
                reasons: [`All alone in the minority – drink ${2 * multiplier} more sip(s) 🥲`],
                take: 2 * multiplier
            });
        }
    }

    if (noAnswerCount === 1) {
        punishmentManager.addPunishment(noAnswerPlayers[0].playerId, {
            reasons: [`Only player who didn't answer – drink ${2 * multiplier} more sip(s) 🥸`],
            take: 2 * multiplier
        });
    } else {
        noAnswerPlayers.forEach(player => {
            punishmentManager.addPunishment(player.playerId, {
                reasons: player.reasons,
                take: player.take
            });
        });
    }

    return {answers, punishments: punishmentManager.getPunishments()};
};

/**
 * Handle Who Would Rather question
 */
const handleWhoWouldRather = (
    question: ICleanWhoWouldRatherQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    const punishmentManager = new PunishmentManager();

    let option1Votes = 0;
    let option2Votes = 0;
    let noAnswerCount = 0;

    let optionOneWon: boolean | null = null;

    const option1Players: IPunishment[] = [];
    const option2Players: IPunishment[] = [];
    const noAnswerPlayers: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.pointsAwarded = 0;
        if (answer.answer === question.options[0]) {
            option1Votes++;
            option1Players.push({
                playerId: answer.playerId,
                reasons: [],
                take: 0,
                give: 0
            });
        } else if (answer.answer === question.options[1]) {
            option2Votes++;
            option2Players.push({
                playerId: answer.playerId,
                reasons: [],
                take: 0,
                give: 0
            });
        } else {
            noAnswerCount++;
            answer.pointsAwarded = -300;
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        }
    });

    if (option1Votes === option2Votes) {
        [...option1Players, ...option2Players, ...noAnswerPlayers].forEach((player) => {
            if (!question.options.includes(player.playerId.toString())) {
                punishmentManager.addPunishment(player.playerId, {
                    reasons: [`Tie – drink ${multiplier} sip(s) each! 🍻`],
                    take: multiplier
                });
            }
        });
    }

    const goodOrBad = question.goodOrBad;

    if (option2Votes < option1Votes) {
        option1Players.forEach((player) => {
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) answer.pointsAwarded = 100;
        });
        option2Players.forEach((player) => {
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) answer.pointsAwarded = -50;
        });
        optionOneWon = true;
    } else if (option2Votes > option1Votes) {
        option2Players.forEach((player) => {
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) answer.pointsAwarded = 100;
        });
        option1Players.forEach((player) => {
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) answer.pointsAwarded = -50;
        });
        optionOneWon = false;
    }

    if (noAnswerCount === 1) {
        punishmentManager.addPunishment(noAnswerPlayers[0].playerId, {
            reasons: [`Only player who didn't answer – drink ${multiplier} more sip(s) 🥸`],
            take: multiplier
        });
    }

    if (option2Votes !== option1Votes && option1Votes === 1 && noAnswerCount === 0) {
        punishmentManager.addPunishment(option1Players[0].playerId, {
            reasons: [`Only player in minority – drink ${2 * multiplier} sip(s) 🤓`],
            take: 2 * multiplier
        });
    }
    if (option2Votes !== option1Votes && option2Votes === 1 && noAnswerCount === 0) {
        punishmentManager.addPunishment(option2Players[0].playerId, {
            reasons: [`Only player in minority – drink ${2 * multiplier} sip(s) 🤓`],
            take: 2 * multiplier
        });
    }
    if (option2Votes === 0 && noAnswerCount === 0) {
        option1Players.forEach((player) => {
            punishmentManager.addPunishment(player.playerId, {
                reasons: [`That was a clear one 🤯 Salut! -  ${multiplier} sip(s) 😄`],
                take: multiplier
            });
        });
    }
    if (option1Votes === 0 && noAnswerCount === 0) {
        option2Players.forEach((player) => {
            punishmentManager.addPunishment(player.playerId, {
                reasons: [`That was a clear one 🤯 Salut! -  ${multiplier} sip(s) 😄`],
                take: multiplier
            });
        });
    }
    if (option2Votes === 0 && option1Votes === 0) {
        [...option2Players, ...option1Players].forEach((player) => {
            punishmentManager.addPunishment(player.playerId, {
                reasons: [`No one answered 😡 -  ${3 * multiplier} sips`],
                take: 3 * multiplier
            });
        });
    }

    if (optionOneWon !== null) {
        const chosenOption = optionOneWon ? question.options[0] : question.options[1];
        const chosenPlayers = optionOneWon ? option1Players : option2Players;
        chosenPlayers.forEach((player) => {
            if (player.playerId.toString() === chosenOption) {
                if (goodOrBad === 'good') {
                    punishmentManager.addPunishment(player.playerId, {
                        reasons: [`You were chosen and it's a good one 🥹 give ${2 * multiplier} sips`],
                        give: 2 * multiplier
                    });
                } else {
                    punishmentManager.addPunishment(player.playerId, {
                        reasons: [`You were chosen and it's a bad one 🫣 take ${2 * multiplier} sips`],
                        take: 2 * multiplier
                    });
                }
            }
        });
    }

    const punishments = punishmentManager.getPunishments();

    return {answers, punishments};
};

/**
 * Handle Word Scramble game
 */
const handleWordScramble = (
    wordScrambleGame: { word: string; scrambled: string },
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    const punishmentManager = new PunishmentManager();
    const correctWord = wordScrambleGame.word.toLowerCase();

    // Sort answers by the time they were answered
    answers.sort((a, b) => new Date(a.answeredAt!).getTime() - new Date(b.answeredAt!).getTime());

    let correctAnswersCount = 0;
    let noAnswerCount = 0;
    let incorrectAnswersCount = 0;

    const correctAnswerPlayers: IPunishment[] = [];
    const incorrectAnswerPlayers: IPunishment[] = [];
    const noAnswerPlayers: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.pointsAwarded = 0;

        if (!answer.answer || answer.answer === '__NOT_ANSWERED__') {
            // Player didn't answer
            noAnswerCount++;
            answer.pointsAwarded = -300;
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier,
            });
        } else {
            if (typeof answer.answer !== "number") {
                const playerAnswers = Array.isArray(answer.answer)
                    ? answer.answer.map((a) => a.toLowerCase())
                    : [answer.answer.toLowerCase()];

                const attempts = playerAnswers.length;

                if (playerAnswers.includes(correctWord)) {
                    // Player found the correct word
                    answer.isCorrect = true;

                    // Calculate points based on number of attempts
                    // Fewer attempts yield more points
                    if (attempts === 1) {
                        answer.pointsAwarded = 100;
                    } else if (attempts === 2) {
                        answer.pointsAwarded = 50;
                        // Punish player for needing 2 attempts
                        punishmentManager.addPunishment(answer.playerId, {
                            reasons: [`Needed ${attempts} attempts – drink ${multiplier} sip(s)`],
                            take: multiplier,
                        });
                    } else {
                        // For 3 or more attempts, deduct points and punish
                        answer.pointsAwarded = 100 - (attempts - 1) * 5;
                        punishmentManager.addPunishment(answer.playerId, {
                            reasons: [`Needed ${attempts} attempts – drink ${multiplier} sip(s)`],
                            take: multiplier,
                        });
                        if (answer.pointsAwarded < 0) {
                            answer.pointsAwarded = -50 * (attempts - 2);
                        }
                    }

                    correctAnswerPlayers.push({
                        playerId: answer.playerId,
                        reasons: [],
                    });
                    correctAnswersCount++;
                } else {
                    // Player didn't find the correct word
                    incorrectAnswersCount++;
                    answer.pointsAwarded = -100;
                    incorrectAnswerPlayers.push({
                        playerId: answer.playerId,
                        reasons: [`Didn't find the correct word – drink ${multiplier} sips`],
                        take: multiplier,
                    });
                }
            }
        }
    });

    // Punish everyone if no one found the correct word
    if (correctAnswersCount === 0) {
        incorrectAnswerPlayers.forEach((player) => {
            player.take = 3 * multiplier;
            player.reasons.push(`No one found the word – drink ${3 * multiplier} sips`);
        });
        noAnswerPlayers.forEach((player) => {
            player.take = 3 * multiplier;
            player.reasons.push(`No one found the word – drink ${3 * multiplier} sips`);
        });
    }

    // If only one player found the correct word
    if (correctAnswersCount === 1) {
        const player = correctAnswerPlayers[0];
        punishmentManager.addPunishment(player.playerId, {
            give: 2 * multiplier,
            reasons: [`Only one who found the word – give ${2 * multiplier} sips`],
        });
    }

    // If only one player didn't answer
    if (noAnswerCount === 1) {
        const player = noAnswerPlayers[0];
        player.take! += 2 * multiplier;
        player.reasons.push(`Only player who didn't answer – drink ${2 * multiplier} extra sips`);
    }

    // If only one player didn't find the word
    if (incorrectAnswersCount === 1 && noAnswerCount === 0) {
        const player = incorrectAnswerPlayers[0];
        player.take! += multiplier;
        player.reasons.push(`Only player who didn't find the word – drink ${multiplier} extra sips`);
    }

    // Bonus for the fastest correct answer
    if (correctAnswersCount > 0) {
        const fastestPlayerId = correctAnswerPlayers[0].playerId;

        //check how many tries the player needed
        const player = answers.find(a => a.playerId.toString() === fastestPlayerId.toString());
        const attempts = Array.isArray(player?.answer) ? player?.answer.length : 1;
        //if the player needed only one try, give bonus
        if (attempts === 1) {
            punishmentManager.addPunishment(fastestPlayerId, {
                give: multiplier,
                reasons: [`Fastest correct answer – give ${multiplier} sip(s)`],
            });
        }


    }

    const punishments = [
        ...punishmentManager.getPunishments(),
        ...incorrectAnswerPlayers,
        ...noAnswerPlayers,
    ];

    return {answers, punishments};
};


/**
 * Handle Code Breaker game
 */
const handleCodeBreaker = (
    codeBreakerGame: { type: 'code-breaker'; code: string },
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[]; punishments: IPunishment[] } => {
    const punishmentManager = new PunishmentManager();
    const correctCode = codeBreakerGame.code;

    // Sort answers by the time they were answered (earlier first)
    answers.sort((a, b) => new Date(a.answeredAt!).getTime() - new Date(b.answeredAt!).getTime());

    let correctAnswersCount = 0;
    let noAnswerCount = 0;

    // Array to store players who guessed the code correctly along with their attempts and answeredAt
    const correctAnswerPlayers: Array<{ playerId: Schema.Types.ObjectId; answeredAt: Date; attempts: number }> = [];

    // Iterate through each answer to assign points and initial punishments
    answers.forEach((answer) => {
        if (!answer.answer || answer.answer === '__NOT_ANSWERED__') {
            // Player didn't answer or didn't guess the code
            noAnswerCount++;
            answer.pointsAwarded = 0; // No points assigned
            punishmentManager.addPunishment(answer.playerId, {
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier,
            });
        } else {
            // Player provided answers
            const lowercasedAttempts = Array.isArray(answer.answer) ? answer.answer : [answer.answer];

            // Find the first attempt where the correct code was guessed
            const correctAttemptIndex = lowercasedAttempts.findIndex(a => a === correctCode);

            if (correctAttemptIndex !== -1) {
                // Player guessed the code
                const attempts = correctAttemptIndex + 1;
                correctAnswersCount++;
                answer.isCorrect = true;
                answer.pointsAwarded = 100;

                correctAnswerPlayers.push({
                    playerId: answer.playerId,
                    answeredAt: answer.answeredAt!,
                    attempts,
                });

                // Assign punishment if attempts are 1 or 2
                if (attempts <= 1) {
                    //make 50/50 chance to give or take
                    if (Math.random() >= 0.5) {
                        punishmentManager.addPunishment(answer.playerId, {
                            reasons: [`Damn, first try 🤩 – give ${multiplier} sip(s)`],
                            give: multiplier,
                        });
                    } else {
                        punishmentManager.addPunishment(answer.playerId, {
                            reasons: [`Cheater 🤨 First Try, Really? 🤣 ${multiplier} sip(s)`],
                            take: multiplier,
                        });
                    }
                }

                if (attempts > 10) {
                    punishmentManager.addPunishment(answer.playerId, {
                        reasons: [`Took you long 🤣 – drink ${multiplier} sip(s)`],
                        take: multiplier,
                    });
                }
                //if attempts between 2 and 5
                if (attempts > 2 && attempts <= 5) {
                    punishmentManager.addPunishment(answer.playerId, {
                        reasons: [`Pretty good 😎 – give ${multiplier} sip(s)`],
                        give: multiplier,
                    });
                }
            } else {
                // Player didn't guess the code correctly in any attempt
                noAnswerCount++;
                answer.pointsAwarded = 0; // No points assigned
                punishmentManager.addPunishment(answer.playerId, {
                    reasons: [`Didn't find the code – drink ${2 * multiplier} sips`],
                    take: 2 * multiplier,
                });
            }
        }
    });

    // Sort correctAnswerPlayers by answeredAt to determine the fastest
    correctAnswerPlayers.sort((a, b) => a.answeredAt.getTime() - b.answeredAt.getTime());

    // Assign bonus points to the first three correct guesses
    correctAnswerPlayers.forEach((player, index) => {
        if (index === 0) {
            // 1st Correct Guess: +50 points
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) {
                answer.pointsAwarded! += 50;
            }
        } else if (index === 1) {
            // 2nd Correct Guess: +30 points
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) {
                answer.pointsAwarded! += 30;
            }
        } else if (index === 2) {
            // 3rd Correct Guess: +10 points
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) {
                answer.pointsAwarded! += 10;
            }
        }
    });

    // If only one player guessed the code, they can give 2 sips to others
    if (correctAnswersCount === 1) {
        const player = correctAnswerPlayers[0];
        punishmentManager.addPunishment(player.playerId, {
            give: 2 * multiplier,
            reasons: [`Only one who found the code – give ${2 * multiplier} sips to others`],
        });
    }

    return {answers, punishments: punishmentManager.getPunishments()};
}


/**
 * Handle Spy Game point and punishment calculations
 */
const handleSpy = (
    question: ICleanSpyQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[]; punishments: IPunishment[] } => {
    const punishmentManager = new PunishmentManager();
    const spyId = question.spy.toString();

    // Initialize vote counts
    const voteCounts: { [key: string]: number } = {};

    // Track voters for the spy
    const voters: string[] = [];

    // Process each answer
    answers.forEach((answer) => {
        const playerId = answer.playerId.toString();

        // Initialize vote count if not present
        if (!voteCounts[playerId]) {
            voteCounts[playerId] = 0;
        }

        // Skip the spy's own answer
        if (playerId === spyId) {
            return;
        }

        const guessedId = answer.answer.toString();

        if (guessedId === spyId) {
            // Correctly identified the spy
            voteCounts[spyId] += 1;
            voters.push(playerId);
            answer.pointsAwarded = 100;
            // No punishment for correct guess beyond point allocation
        } else {
            // Incorrectly identified another player as the spy
            voteCounts[guessedId] = (voteCounts[guessedId] || 0) + 1;
            answer.pointsAwarded = -50;
            // Punishment: Drink 1 × multiplier sips for wrong guess
            punishmentManager.addPunishment(playerId, {
                reasons: [`Incorrectly identified the spy – drink ${multiplier} sip(s)`],
                take: multiplier,
            });
        }
    });

    // Calculate spy's points
    let spyPoints = 100; // Initial points
    spyPoints -= voteCounts[spyId] * 25; // Deduct 25 points per vote

    if (voteCounts[spyId] === 0) {
        spyPoints += 300; // Award 300 extra points if spy gets 0 votes
    }

    // Update the spy's points in the answers array
    const spyAnswerIndex = answers.findIndex(
        (answer) => answer.playerId.toString() === spyId
    );

    if (spyAnswerIndex !== -1) {
        answers[spyAnswerIndex].pointsAwarded = spyPoints;
    } else {
        // If the spy's answer is not present in the answers array, create a new entry
        answers.push({
            playerId: new Schema.Types.ObjectId(spyId),
            questionId: question._id,
            answer: "__SPY__",
            answeredAt: new Date(),
            pointsAwarded: spyPoints,
            isCorrect: false,
        });
    }

    // Determine if any player has the same or more votes as the spy
    let anotherPlayerHasSameOrMoreVotes = false;

    Object.keys(voteCounts).forEach((playerId) => {
        if (playerId === spyId) return;
        if (voteCounts[playerId] >= voteCounts[spyId]) {
            anotherPlayerHasSameOrMoreVotes = true;
        }
    });

    // Assign special bonuses/penalties
    if (voteCounts[spyId] > 0) {
        if (!anotherPlayerHasSameOrMoreVotes) {
            // Spy has more votes than any other player
            // Spy is caught
            // Spy takes 2 × multiplier sips
            punishmentManager.addPunishment(spyId, {
                reasons: [`You were identified as the spy – drink ${2 * multiplier} sip(s)`],
                take: 2 * multiplier,
            });
        } else {
            // Another player has same or more votes than the spy
            // Spy can give 1 × multiplier sips
            punishmentManager.addPunishment(spyId, {
                reasons: [`You were partially identified – give ${multiplier} sip(s)`],
                give: multiplier,
            });
        }
    } else {
        // Spy was not caught (0 votes)
        // All non-spies except spy drink 2 × multiplier sips
        answers.forEach((answer) => {
            const playerId = answer.playerId.toString();
            if (playerId !== spyId) {
                punishmentManager.addPunishment(playerId, {
                    reasons: [`Spy was not identified – drink ${2 * multiplier} sip(s)`],
                    take: 2 * multiplier,
                });
            }
        });

        // Spy can distribute 3 × multiplier sips
        punishmentManager.addPunishment(spyId, {
            reasons: [`You successfully remained hidden – give ${3 * multiplier} sip(s)`],
            give: 3 * multiplier,
        });
    }

    // Additional Special Rules
    if (voteCounts[spyId] === 0) {
        // Spy did not get any votes
        // All non-spies drink 2 × multiplier sips (already handled above)
        // Spy can give 3 × multiplier sips (already handled above)
    }

    // Check if spy has the most points
    const allPlayerPoints: { [key: string]: number } = {};

    answers.forEach((answer) => {
        const pid = answer.playerId.toString();
        allPlayerPoints[pid] = (allPlayerPoints[pid] || 0) + (answer.pointsAwarded || 0);
    });

    const spyTotalPoints = allPlayerPoints[spyId] || 0;

    let spyHasMostPoints = true;

    Object.keys(allPlayerPoints).forEach((playerId) => {
        if (playerId === spyId) return;
        if (allPlayerPoints[playerId] > spyTotalPoints) {
            spyHasMostPoints = false;
        }
    });

    if (spyHasMostPoints && voteCounts[spyId] > 0) {
        // All players who voted for the spy receive +50 points each
        voters.forEach((voterId) => {
            const voterAnswerIndex = answers.findIndex(
                (answer) => answer.playerId.toString() === voterId
            );
            if (voterAnswerIndex !== -1) {
                answers[voterAnswerIndex].pointsAwarded! += 50;
            } else {
                // If the voter's answer is not present, create a new entry
                answers.push({
                    playerId: new Schema.Types.ObjectId(voterId),
                    questionId: question._id,
                    answer: spyId,
                    answeredAt: new Date(),
                    pointsAwarded: 50,
                    isCorrect: true,
                });
            }
        });
    }

    if (anotherPlayerHasSameOrMoreVotes) {
        // Spy receives +30 points
        if (spyAnswerIndex !== -1) {
            answers[spyAnswerIndex].pointsAwarded! += 30;
        } else {
            answers.push({
                playerId: new Schema.Types.ObjectId(spyId),
                questionId: question._id,
                answer: "__SPY__",
                answeredAt: new Date(),
                pointsAwarded: 30,
                isCorrect: false,
            });
        }
    }

    return {answers, punishments: punishmentManager.getPunishments()};
};

export default handleSpy;
