import {OperationResult} from "../types";
import Game, {IAnswer, IMiniGame, IPunishment} from "../models/Game";
import {
    ICleanedQuestion,
    ICleanRankingQuestion,
    ICleanWhoWouldRatherQuestion,
    IMultipleChoiceQuestion, IRankingQuestion, IWhatWouldYouRatherQuestion
} from "../models/Question";
import {getQuestionById} from "./questionController";
import {Schema} from "mongoose";

/**
 * Calculate ponts for Questions
 */
export const calculatePointsForQuestion = async (gameCode: string): Promise<OperationResult<{
    answers: IAnswer[],
    punishments: IPunishment[]
}>> => {
    try {

        const game = await Game.findOne({code: gameCode, isActive: true});
        if (!game) {
            return {success: false, error: 'Game not found'};
        }
        const currentQuestionId = (game.rounds[game.currentRoundIndex].data as ICleanedQuestion)._id;
        const result = await getQuestionById(currentQuestionId.toString());
        if (!result.success) {
            console.error('Error fetching current question:', result.error);
            return {success: false, error: 'Error fetching current question'};
        }
        const currentQuestion = result.data!;

        if (currentQuestion.type === 'multiple-choice') {
            console.log('Correct Option Index:', currentQuestion.correctOptionIndex);

            const currentMPCQuestion = game.rounds[game.currentRoundIndex].data as IMultipleChoiceQuestion;
            currentMPCQuestion.correctOptionIndex = currentQuestion.correctOptionIndex;
            game.rounds[game.currentRoundIndex].data = currentMPCQuestion;

            console.log(game.rounds[game.currentRoundIndex].data)



            await game.save();
        }

        const answers: IAnswer[] = game.answers[game.currentRoundIndex] || [];
        let whoWouldRatherQuestion = currentQuestion.type === 'who-would-rather' ? game.rounds[game.currentRoundIndex].data! as ICleanWhoWouldRatherQuestion : null;

        // Players who didn't answer
        const playersNotAnswered = game.players
            .filter(p => !game.playersAnswered.includes(p))
            .map(p => ({
                playerId: p,
                questionId: currentQuestionId,
                answer: '__NOT_ANSWERED__',
                answeredAt: new Date(),
                isCorrect: false,
                pointsAwarded: 0,
            }));

        answers.push(...playersNotAnswered);
        const multiplier = game.settings.punishmentMultiplier;

        let updatedAnswers: IAnswer[] = [];
        let punishments: IPunishment[] = [];

        switch (currentQuestion.type) {
            case 'multiple-choice':
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleMultipleChoice(currentQuestion, answers, multiplier));
                break;

            case 'what-would-you-rather':
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleWhatWouldYouRather(currentQuestion, answers, multiplier));
                break;

            case 'who-would-rather':
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleWhoWouldRather(whoWouldRatherQuestion!, answers, multiplier));
                break
            case 'ranking':
                const {
                    _answers,
                    _punishments,
                    finalRanking
                } = handleRanking(currentQuestion, answers, multiplier);

                const currentRankingQuestion = game.rounds[game.currentRoundIndex].data! as ICleanRankingQuestion;
                currentRankingQuestion.finalRanking = finalRanking;
                game.rounds[game.currentRoundIndex].data = currentRankingQuestion;
                game.markModified('rounds');

                await game.save();

                updatedAnswers = _answers;
                punishments = _punishments;
                break;

            default:
                return {success: false, error: 'Unknown Question Type'};
        }

        return {
            success: true,
            data: {
                answers: updatedAnswers,
                punishments: punishments,
            },
        };
    } catch (e) {
        return {success: false, error: 'Invalid question type @calculatePointsForQuestion'};
    }
}

/**
 * Calculate ponts for MiniGames
 */
export const calculatePointsForMiniGames = async (gameCode: string): Promise<OperationResult<{
    answers: IAnswer[],
    punishments: IPunishment[]
}>> => {
    try {

        const game = await Game.findOne({code: gameCode, isActive: true});
        if (!game) {
            return {success: false, error: 'Game not found'};
        }

        const answers: IAnswer[] = game.answers[game.currentRoundIndex] || [];

        // Players who didn't answer
        const playersNotAnswered = game.players
            .filter(p => !game.playersAnswered.includes(p))
            .map(p => ({
                playerId: p,
                answer: '__NOT_ANSWERED__',
                answeredAt: new Date(),
                isCorrect: false,
                pointsAwarded: 0,
            }));

        answers.push(...playersNotAnswered);
        const multiplier = game.settings.punishmentMultiplier;

        let updatedAnswers: IAnswer[] = [];
        let punishments: IPunishment[] = [];

        const currentMiniGame = game.rounds[game.currentRoundIndex].data as IMiniGame;


        const timerFinishedAt = game.timeRemaining
        const timeLimit = game.settings.timeLimit;

        switch (currentMiniGame.type) {
            case "hide-and-seek":
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleHideAndSeek(answers, multiplier, timerFinishedAt, timeLimit));
                break;
            case "memory":
                ({
                    answers: updatedAnswers,
                    punishments
                } = handleMemory(answers, multiplier));
                break;

            default:
                return {success: false, error: 'Unknown Question Type'};
        }
        return {
            success: true,
            data: {
                answers: updatedAnswers,
                punishments: punishments,
            },
        };

    } catch (e) {
        console.log(e);
        return {success: false, error: 'Invalid mini game type @calculatePointsForMiniGames'};

    }
}


/**
 * Handle Memory mini game punishment and points calculation
 */
const handleMemory = (
    answers: IAnswer[],
    multiplier: number,
): { answers: IAnswer[]; punishments: IPunishment[] } => {
    const punishmentsMap: Map<string, IPunishment> = new Map();


    let noAnswerCount = 0;
    const noAnswerPlayers: IPunishment[] = [];
    const correctAnswers: Schema.Types.ObjectId[] = [];


    answers.forEach((answer) => {
        answer.pointsAwarded = 0;

        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            // Player didn't answer
            noAnswerCount++;
            answer.pointsAwarded = -300; // Deduct points for not answering
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didnt solve in time 😢 ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        } else {
            answer.pointsAwarded = 100;
            correctAnswers.push(answer.playerId);
            if (typeof answer.answer === 'number') {
                //perfect score = answer === 0
                if (answer.answer === 0) {
                    answer.pointsAwarded += 100;
                }
                //if answer is smaller than 5
                if (answer.answer < 5) {
                    answer.pointsAwarded += 50;
                }
                //if answer is more than 10
                if (answer.answer > 10) {
                    answer.pointsAwarded -= 50;
                }
            }
        }
    });

    const punishments = [...noAnswerPlayers];

    //add punishments
    //if everyone answered correctly
    if (noAnswerCount === 0) {
        punishments.push({
            playerId: correctAnswers[0],
            reasons: [`You were the fastest ⚡️ Give ${multiplier} sips`],
            give: multiplier
        })
    }
    if (noAnswerCount === answers.length) {
        //if no one answered, everyone gets 1 sip
        answers.forEach((answer) => {
            punishments.push({
                playerId: answer.playerId,
                reasons: [`No one answered 🤷🏻‍♂️ take ${multiplier} sips`],
                take: multiplier
            })
        })
    }
    if (correctAnswers.length === 1) {
        //if only one person answered correctly
        punishments.push({
            playerId: correctAnswers[0],
            reasons: [`You were the only one who solved it 🥳 Give ${2 * multiplier} sips`],
            give: 2 * multiplier
        })
    }


    return {answers, punishments};
}


/**
 * Handle Hide-and-Seek mini game punishment and points calculation
 */
const handleHideAndSeek = (
    answers: IAnswer[],
    multiplier: number,
    timerFinishedAt: Date,
    timeLimit: number
): { answers: IAnswer[]; punishments: IPunishment[] } => {
    const punishmentsMap: Map<string, IPunishment> = new Map();

    // Helper function to add or update punishments in the map
    const addPunishment = (
        playerId: Schema.Types.ObjectId,
        newPunishment: Partial<IPunishment>
    ) => {
        const key = playerId.toString();
        if (punishmentsMap.has(key)) {
            const existingPunishment = punishmentsMap.get(key)!;
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
            punishmentsMap.set(key, {
                playerId,
                reasons: newPunishment.reasons || [],
                give: newPunishment.give || 0,
                take: newPunishment.take || 0,
            });
        }
    };

    // Separate answers into those who answered and those who didn't
    const answeredAnswers = answers.filter(
        (answer): answer is IAnswer & { answer: number } =>
            typeof answer.answer === 'number'
    );
    const notAnswered = answers.filter(
        (answer) => answer.answer === '__NOT_ANSWERED__'
    );

    // Sort answered answers by answeredAt ascending (earlier answers first)
    const sortedAnswers = answeredAnswers.sort(
        (a, b) =>
            new Date(a.answeredAt!).getTime() -
            new Date(b.answeredAt!).getTime()
    );

    const totalPlayers = answers.length;

    // Arrays to track specific punishment categories
    const firstTryPlayers: Schema.Types.ObjectId[] = [];
    const tooManyTriesPlayers: Schema.Types.ObjectId[] = [];
    const fastPlayers: Schema.Types.ObjectId[] = [];
    const slowPlayers: Schema.Types.ObjectId[] = [];
    const noAnswerPlayers: Schema.Types.ObjectId[] = [];

    // Assign points based on answer and accumulate punishments
    sortedAnswers.forEach((answer, index) => {
        const answeredAtTime = new Date(answer.answeredAt!).getTime();
        const timerFinishedTime = timerFinishedAt.getTime();
        const timeDifference =
            ((timerFinishedTime - answeredAtTime) / 1000 - timeLimit) * -1;

        // Base points
        let points = 100;

        // Additional points for being early
        const bonusPoints = (totalPlayers - index) * 10; // Example: first = 50, second = 40, etc.
        points += bonusPoints;

        // Additional points or penalties based on answer value
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
        // if timeDifference between 3 and 10 seconds
        if (timeDifference >= 3 && timeDifference < 10) {
            points += 10;
        }
        // if timeDifference between 10 and 20 seconds
        if (timeDifference >= 10 && timeDifference < 20) {
            slowPlayers.push(answer.playerId);
            points -= 10;
        }

        // Assign calculated points
        answer.pointsAwarded = points;
    });

    // Handle players who did not answer
    notAnswered.forEach((answer) => {
        answer.pointsAwarded = -300;
        noAnswerPlayers.push(answer.playerId);
    });

    // Apply punishments based on accumulated categories

    // First Try Punishments
    firstTryPlayers.forEach((playerId) => {
        addPunishment(playerId, {
            reasons: [`You got it on the first try!`],
            give: 0, // Placeholder, actual give handled below
        });
    });

    // Too Many Tries Punishments
    tooManyTriesPlayers.forEach((playerId) => {
        addPunishment(playerId, {
            reasons: [`You tried too many times! Take ${multiplier} sips`],
            take: multiplier,
        });
    });

    // Fast Players Punishments
    fastPlayers.forEach((playerId) => {
        addPunishment(playerId, {
            reasons: [`You were fast! give ${multiplier}`],
            give: multiplier,
        });
    });

    // Slow Players Punishments
    slowPlayers.forEach((playerId) => {
        addPunishment(playerId, {
            reasons: [`You were slow! Take ${multiplier} sips`],
            take: multiplier,
        });
    });

    // No Answer Punishments
    noAnswerPlayers.forEach((playerId) => {
        addPunishment(playerId, {
            reasons: [`Didn't answer (or too late) – drink ${3 * multiplier} sips`],
            take: 3 * multiplier,
        });
    });

    // Apply special rules for unique punishments

    // If only one player got it on the first try
    if (firstTryPlayers.length === 1) {
        const playerId = firstTryPlayers[0];
        addPunishment(playerId, {
            reasons: [`Only one on First Try! Give ${2 * multiplier} sips`],
            give: 2 * multiplier,
        });
    }

    // If only one player tried too many times and no one didn't answer
    if (tooManyTriesPlayers.length === 1 && noAnswerPlayers.length === 0) {
        const playerId = tooManyTriesPlayers[0];
        addPunishment(playerId, {
            reasons: [`Only one tried too many times! Take ${multiplier} sips`],
            take: multiplier,
        });
    }

    // If only one player was fast
    if (fastPlayers.length === 1) {
        const playerId = fastPlayers[0];
        addPunishment(playerId, {
            reasons: [`You were the only fast! Give ${multiplier} sips`],
            give: multiplier,
        });
    }

    // If only one player was slow and no one didn't answer
    if (slowPlayers.length === 1 && noAnswerPlayers.length === 0) {
        const playerId = slowPlayers[0];
        addPunishment(playerId, {
            reasons: [`You were slow! Take ${multiplier} sips`],
            take: multiplier,
        });
    }

    // If only one player did not answer
    if (noAnswerPlayers.length === 1) {
        const playerId = noAnswerPlayers[0];
        addPunishment(playerId, {
            reasons: [`Only you didn't finish 🫠 - take ${3 * multiplier} sips`],
            take: 3 * multiplier,
        });
    }

    // Convert the map to an array
    const punishments = Array.from(punishmentsMap.values()).map((punishment) => ({
        ...punishment,
        give: punishment.give || 0,
        take: punishment.take || 0,
    }));

    return {answers, punishments};
};

/**
 * Handle ranking question by combining individual rankings into a final ranking,
 * calculating points, and applying punishments based on "goodOrBad" attribute.
 */
const handleRanking = (
    question: IRankingQuestion,
    answers: IAnswer[],
    multiplier: number
): { _answers: IAnswer[], _punishments: IPunishment[], finalRanking: string[] } => {
    const noAnswerPlayers: IPunishment[] = [];
    const rankingMap: Map<string, number> = new Map(); // Map to store cumulative rank points for each player


    // Handle players who didn’t answer
    answers.forEach(answer => {
        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            answer.pointsAwarded = -300;
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        } else {
            // Sum rankings for each player who answered
            if (typeof answer.answer !== "number") {
                const rankedPlayers = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
                rankedPlayers.forEach((playerId, rankIndex) => {
                    const currentRank = rankingMap.get(playerId) || 0;
                    rankingMap.set(playerId, currentRank + rankIndex + 1); // +1 to make ranks 1-based
                });
            }
        }
    });

    // Aggregate rankings and sort players by rank points (lowest = best rank)
    const finalRanking = Array.from(rankingMap.entries())
        .map(([playerId, rankPoints]) => ({playerId, rankPoints}))
        .sort((a, b) => a.rankPoints - b.rankPoints);

    // Calculate max possible deviation for normalization
    const maxDeviation = finalRanking.length * (finalRanking.length - 1) / 2;

    const punishments: IPunishment[] = [];
    answers.forEach(answer => {
        if (answer.answer && answer.answer !== "__NOT_ANSWERED__") {
            const playerRanking = Array.isArray(answer.answer) ? answer.answer : [answer.answer];

            // Calculate deviation from final ranking
            let deviation = 0;
            playerRanking.forEach((playerId, index) => {
                const finalRank = finalRanking.findIndex(r => r.playerId === playerId);
                deviation += Math.abs(index - finalRank);
            });

            // Calculate normalized score out of 500 points
            const score = Math.max(0, 500 - Math.floor((deviation / maxDeviation) * 500));
            answer.pointsAwarded = score;

            // Apply base punishments based on the score
            let punishment: IPunishment | null;
            if (score === 500) {
                punishment = {
                    playerId: answer.playerId,
                    give: 2 * multiplier,
                    reasons: [`Perfection 🤩 – give ${2 * multiplier} sips!`]
                };
            } else if (score >= 400) {
                punishment = {
                    playerId: answer.playerId,
                    give: multiplier,
                    reasons: [`Close to Perfection ☺️ – give ${multiplier} sips!`]
                };
            } else if (score >= 200) {
                punishment = {
                    playerId: answer.playerId,
                    take: multiplier,
                    reasons: [`Not so good 🤨 – take ${multiplier} sips!`]
                };
            } else if (score >= 1) {
                punishment = {
                    playerId: answer.playerId,
                    take: 2 * multiplier,
                    reasons: [`Bad Ranking ☹️ – take ${2 * multiplier} sips!`]
                };
            } else {
                punishment = {
                    playerId: answer.playerId,
                    take: 3 * multiplier,
                    reasons: [`FOR REAL 😂 – take ${3 * multiplier} sips!`]
                };
            }

            if (punishment) {
                punishments.push(punishment);
            }
        }
    });

    // Additional points adjustments and updated punishments based on `goodOrBad`
    const adjustmentFactor = 100; // Base adjustment factor for points
    const sortedFinalRanking = finalRanking.sort((a, b) => a.rankPoints - b.rankPoints); // Sort by best rank

    sortedFinalRanking.forEach((rank, index) => {
        const player = answers.find(answer => answer.playerId.toString() === rank.playerId);
        if (!player) return;

        const adjustment = adjustmentFactor * (sortedFinalRanking.length - index - 1);

        if (question.goodOrBad === 'good') {
            // Reward players in top positions
            player.pointsAwarded! += adjustment;

            // Update existing punishment to add rewards based on ranking
            const playerPunishment = punishments.find(p => p.playerId.toString() === rank.playerId);
            if (playerPunishment) {
                if (index === 0) {
                    playerPunishment.give = 3 * multiplier;
                    playerPunishment.reasons.push(`You've been ranked #1 😇 – give ${3 * multiplier} sips!`);
                } else if (index === 1) {
                    playerPunishment.give = 2 * multiplier;
                    playerPunishment.reasons.push(`>ou've been ranked #2 ☺️ – give ${2 * multiplier} sips!`);
                } else if (index === 2) {
                    playerPunishment.give = multiplier;
                    playerPunishment.reasons.push(`You've been ranked #3 👏🏼 – give ${multiplier} sips!`);
                }
            }
        } else if (question.goodOrBad === 'bad') {
            // Penalize players in top positions
            player.pointsAwarded! -= adjustment;

            // Update existing punishment to add penalties based on ranking
            const playerPunishment = punishments.find(p => p.playerId.toString() === rank.playerId);
            if (playerPunishment) {
                if (index === 0) {
                    playerPunishment.take = 3 * multiplier;
                    playerPunishment.reasons.push(`You've been ranked #1 🫣🫵 – give ${3 * multiplier} sips!`);
                } else if (index === 1) {
                    playerPunishment.take = 2 * multiplier;
                    playerPunishment.reasons.push(`You've been ranked #2 🤨🫵 – give ${2 * multiplier} sips!`);
                } else if (index === 2) {
                    playerPunishment.take = multiplier;
                    playerPunishment.reasons.push(`You've been ranked #3 🫠🫵 – give ${multiplier} sips!`);
                }
            }
        }
    });

    const finalRankingArray = sortedFinalRanking.map((rank) => {
        return rank.playerId
    })

    return {
        _answers: answers,
        _punishments: [...punishments, ...noAnswerPlayers],
        finalRanking: finalRankingArray
    };
};

/**
 * Handle multiple-choice question punishment and point calculation.
 */
const handleMultipleChoice = (
    question: IMultipleChoiceQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    const correctAnswer = question.options[question.correctOptionIndex];

    // Sort answers by time for bonus points
    answers.sort((a, b) => new Date(a.answeredAt!).getTime() - new Date(b.answeredAt!).getTime());

    const bonusPoints = [50, 25, 10]; // Bonus points for the first three correct answers
    let correctAnswersCount = 0;
    let noAnswerCount = 0;
    let wrongAnswersCount = 0;

    // Arrays to track players for punishments
    let noAnswerPlayers: IPunishment[] = [];
    let wrongAnswerPlayers: IPunishment[] = [];
    let correctAnswerPlayers: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.isCorrect = false;
        answer.pointsAwarded = 0;

        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            // Player didn't answer
            noAnswerCount++;
            answer.pointsAwarded = -300; // Deduct points for not answering
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        } else if (answer.answer === correctAnswer) {
            // Correct answer
            answer.isCorrect = true;
            answer.pointsAwarded = 100; // Base points for correct answer
            if (correctAnswersCount < 3) {
                answer.pointsAwarded += bonusPoints[correctAnswersCount]; // Bonus points for top 3
            }
            correctAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: []
            });
            correctAnswersCount++;
        } else {
            // Incorrect answer
            wrongAnswersCount++;
            answer.pointsAwarded = -100; // Deduct points for incorrect answer
            wrongAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Answered incorrectly – drink ${multiplier} sip(s)`],
                take: multiplier
            });
        }
    });

    // If everyone answered incorrectly, everyone drinks 3 sips
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

    // Bonus: If only one player answered correctly, they can give 2 sips
    if (correctAnswerPlayers.length === 1) {
        correctAnswerPlayers[0].give = 2 * multiplier;
        correctAnswerPlayers[0].reasons.push(`Only correct answer – give ${2 * multiplier} sip(s)`);
    }

    // If only one player didn’t answer, they drink 2 more sips
    if (noAnswerCount === 1) {
        noAnswerPlayers[0].take! += 2 * multiplier;
        noAnswerPlayers[0].reasons.push(`Only player who didn't answer – drink ${2 * multiplier} extra sips`);
    }

    // If only one player answered incorrectly, they drink 2 more sips
    if (wrongAnswersCount === 1 && noAnswerCount === 0) {
        wrongAnswerPlayers[0].take! += multiplier;
        wrongAnswerPlayers[0].reasons.push(`Only player who answered wrong – drink ${multiplier} extra sip(s)`);
    }

    // If all players answered correctly, the fastest player gives 1 sip
    if (noAnswerCount === 0 && wrongAnswersCount === 0 && correctAnswerPlayers.length > 0) {
        correctAnswerPlayers[0].give = multiplier; // Fastest player gives a sip
        correctAnswerPlayers[0].reasons = correctAnswerPlayers[0].reasons || []; // Ensure reasons array exists
        correctAnswerPlayers[0].reasons.push(`Fastest 🚀 – give ${multiplier} sip(s)`);
    }

    // If all players answered incorrectly, the slowest player takes 1 extra sip
    if (noAnswerCount === 0 && correctAnswersCount === 0 && wrongAnswerPlayers.length > 0) {
        wrongAnswerPlayers[wrongAnswerPlayers.length - 1].take! += multiplier; // Slowest player takes an extra sip
        wrongAnswerPlayers[wrongAnswerPlayers.length - 1].reasons!.push(`Slowest and wrong 🐢 – drink ${multiplier} extra sip(s)`);
    }

    // Prepare the final punishments array by combining all players, ensuring correct answer players are added
    const correctAnswerPunishments = correctAnswerPlayers.map((player, index) => ({
        playerId: player.playerId,
        reasons: [...(player.reasons || []), `Answered correctly as #${index + 1}`], // Add index to reasons
        give: player.give || undefined, // Only include give if it exists
    }));

    // Combine all punishment arrays
    const punishments = [...noAnswerPlayers, ...wrongAnswerPlayers, ...correctAnswerPunishments];

    return {
        answers,
        punishments
    };
};
/**
 * Handle What Would you Rather question punishment and point calculation.
 */
const handleWhatWouldYouRather = (
    question: IWhatWouldYouRatherQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    const option1 = question.options[0];
    const option2 = question.options[1];

    let option1Votes = 0;
    let option2Votes = 0;
    let noAnswerCount = 0;

    // Arrays to track players for points and punishments
    let option1Players: IPunishment[] = [];
    let option2Players: IPunishment[] = [];
    let noAnswerPlayers: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.pointsAwarded = 0;

        if (!answer.answer || answer.answer === "__NOT_ANSWERED__") {
            // Player didn't answer
            noAnswerCount++;
            answer.pointsAwarded = -300; // Deduct points for not answering
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

    // Handle point awarding
    const totalVotes = option1Votes + option2Votes;

    // Check for tie (equal number of votes)
    const isTie = option1Votes === option2Votes && totalVotes > 0;

    if (!isTie && totalVotes > 0) {
        const majorityPlayers = option1Votes > option2Votes ? option1Players : option2Players;

        majorityPlayers.forEach((player) => {
            const answer = answers.find(a => a.playerId.toString() === player.playerId.toString());
            if (answer) {
                answer.pointsAwarded = 100 * multiplier; // Award points for being in the majority
            }
        });
    }

    // Handle punishments
    const punishments: IPunishment[] = [];

    if (isTie) {
        // If there is a tie, everyone drinks
        const tiedPlayers = [...option1Players, ...option2Players];
        tiedPlayers.forEach((player) => {
            player.take = multiplier;
            player.reasons.push(`Tie – drink ${multiplier} sip(s) each! 🍻`);
            punishments.push(player);
        });
    } else {
        // Handle majority and minority punishments
        const majorityPlayers = option1Votes > option2Votes ? option1Players : option2Players;
        const minorityPlayers = option1Votes > option2Votes ? option2Players : option1Players;

        majorityPlayers.forEach((player, index) => {
            player.reasons.push(`In the majority (#${index + 1})`);
            punishments.push(player);
        });

        minorityPlayers.forEach((player) => {
            player.take = 2 * multiplier;
            player.reasons.push(`In the minority – drink ${2 * multiplier} sip(s) 🍷`);
            punishments.push(player);
        });

        // If one option has only one vote and all players answered, the lonely one should get extra sips
        if (minorityPlayers.length === 1) {
            minorityPlayers[0].take! += 2 * multiplier;
            minorityPlayers[0].reasons.push(`All alone in the minority – drink ${2 * multiplier} more sip(s) 🥲`);
        }
    }

    // If only one player didn’t answer, they drink more sips
    if (noAnswerCount === 1) {
        noAnswerPlayers[0].take! += 2 * multiplier;
        noAnswerPlayers[0].reasons.push(`Only player who didn't answer – drink ${2 * multiplier} more sip(s) 🥸`);
        punishments.push(...noAnswerPlayers);
    } else {
        punishments.push(...noAnswerPlayers);
    }

    return {
        answers,
        punishments
    };
};
/**
 * Handle Who Would you Rather question punishment and point calculation.
 */
const handleWhoWouldRather = (
    question: ICleanWhoWouldRatherQuestion,
    answers: IAnswer[],
    multiplier: number
): { answers: IAnswer[], punishments: IPunishment[] } => {
    console.log(answers);
    console.log(question);

    console.log(answers)


    let option1Votes = 0;
    let option2Votes = 0;
    let noAnswerCount = 0;

    let optionOneWon = null


    // Arrays to track players for points and punishments
    let option1Players: IPunishment[] = [];
    let option2Players: IPunishment[] = [];
    let noAnswerPlayers: IPunishment[] = [];
    const punishments: IPunishment[] = [];

    answers.forEach((answer) => {
        answer.pointsAwarded = 0
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
            answer.pointsAwarded = -300
            noAnswerPlayers.push({
                playerId: answer.playerId,
                reasons: [`Didn't answer – drink ${2 * multiplier} sips`],
                take: 2 * multiplier
            });
        }
    })


    //check if there is a tie
    if (option1Votes === option2Votes) {
        //no one gets points and everybody has to drink except the two payers
        option1Players.forEach((player) => {
            if (!question.options.includes(player.playerId.toString())) {
                player.take! += multiplier
                player.reasons.push(`Tie – drink ${multiplier} sip(s) each! 🍻`);
            }
        });
        option2Players.forEach((player) => {
            if (!question.options.includes(player.playerId.toString())) {
                player.take! += multiplier
                player.reasons.push(`Tie – drink ${multiplier} sip(s) each! 🍻`);
            }
        });
        noAnswerPlayers.forEach((player) => {
            if (!question.options.includes(player.playerId.toString())) {
                player.take! += multiplier
                player.reasons.push(`Tie – drink ${multiplier} sip(s) each! 🍻`);
            }
        });
    }

    const goodOrBad = question.goodOrBad

    if (option2Votes < option1Votes) {
        // add 100 points to the answer
        option1Players.forEach((player) => {
            //update pointsAwarded in Answers where playerID = player.playerId
            answers.forEach((answer) => {
                if (answer.playerId.toString() === player.playerId.toString()) {
                    answer.pointsAwarded = 100
                }
            });
        });
        option2Players.forEach((player) => {
            //update pointsAwarded in Answers where playerID = player.playerId
            answers.forEach((answer) => {
                if (answer.playerId.toString() === player.playerId.toString()) {
                    answer.pointsAwarded = -50
                }
            });
        });
        optionOneWon = true

    }
    if (option2Players > option1Players) {
        option2Players.forEach((player) => {
            //update pointsAwarded in Answers where playerID = player.playerId
            answers.forEach((answer) => {
                if (answer.playerId.toString() === player.playerId.toString()) {
                    answer.pointsAwarded = 100
                }
            });
        });
        option1Players.forEach((player) => {
            //update pointsAwarded in Answers where playerID = player.playerId
            answers.forEach((answer) => {
                if (answer.playerId.toString() === player.playerId.toString()) {
                    answer.pointsAwarded = -50
                }
            });
        });
        optionOneWon = false
    }

    //if only one player didnt answer, add one sip more
    if (noAnswerCount === 1) {
        noAnswerPlayers[0].take! += multiplier;
        noAnswerPlayers[0].reasons.push(`Only player who didn't answer – drink ${multiplier} more sip(s) 🥸`);
    }


    //if only one is in minority and all answered he gets 2 sips
    if (option2Votes !== option1Votes && option1Votes === 1 && noAnswerCount === 0) {
        option1Players[0].take! += 2 * multiplier;
        option1Players[0].reasons.push(`Only player in minority – drink ${2 * multiplier} sip(s) 🤓`);
    }
    if (option2Votes !== option1Votes && option2Votes === 1 && noAnswerCount === 0) {
        option2Players[0].take! += 2 * multiplier;
        option2Players[0].reasons.push(`Only player in minority – drink ${2 * multiplier} sip(s) 🤓`);
    }
    if (option2Votes === 0 && noAnswerCount === 0) {
        option1Players.forEach((player) => {
            player.take = multiplier
            player.reasons.push(`That was a clear one 🤯 Salut! -  ${multiplier} sip(s) 😄`)
        })
    }
    if (option1Votes === 0 && noAnswerCount === 0) {
        option2Players.forEach((player) => {
            player.take = multiplier
            player.reasons.push(`That was a clear one 🤯 Salut! -  ${multiplier} sip(s) 😄`)
        })
    }
    if (option2Votes === 0 && option1Votes === 0) {
        option2Players.forEach((player) => {
            player.take = 3 * multiplier
            player.reasons.push(`No one answered 😡 -  ${3 * multiplier} sips`)
        })
        option1Players.forEach((player) => {
            player.take = 3 * multiplier
            player.reasons.push(`No one answered 😡 -  ${3 * multiplier} sips`)
        })
    }

    if (optionOneWon === true) {
        option1Players.forEach((player) => {
            if (player.playerId.toString() === question.options[0]) {
                if (goodOrBad === 'good') {
                    player.give! += 2 * multiplier
                    player.reasons.push(`You were chosen and its a good one 🥹 give ${2 * multiplier} sips`)
                } else {
                    player.take! += 2 * multiplier
                    player.reasons.push(`You were chosen and its a bad one 🫣 take ${2 * multiplier} sips`)
                }

            }
        })
        option2Players.forEach((player) => {
            if (player.playerId.toString() === question.options[0]) {
                if (goodOrBad === 'good') {
                    player.give! += 2 * multiplier
                    player.reasons.push(`You were chosen and its a good one 🥹 give ${2 * multiplier} sips`)
                } else {
                    player.take! += 2 * multiplier
                    player.reasons.push(`You were chosen and its a bad one 🫣 take ${2 * multiplier} sips`)
                }

            }
        })
    }
    if (optionOneWon === false) {
        {
            option1Players.forEach((player) => {
                if (player.playerId.toString() === question.options[1]) {
                    if (goodOrBad === 'good') {
                        player.give! += 2 * multiplier
                        player.reasons.push(`You were chosen and its a good one 🥹 give ${2 * multiplier} sips`)
                    } else {
                        player.take! += 2 * multiplier
                        player.reasons.push(`You were chosen and its a bad one 🫣 take ${2 * multiplier} sips`)
                    }

                }
            })
            option2Players.forEach((player) => {
                if (player.playerId.toString() === question.options[1]) {
                    if (goodOrBad === 'good') {
                        player.give! += 2 * multiplier
                        player.reasons.push(`You were chosen and its a good one 🥹 give ${2 * multiplier} sips`)
                    } else {
                        player.take! += 2 * multiplier
                        player.reasons.push(`You were chosen and its a bad one 🫣 take ${2 * multiplier} sips`)
                    }

                }
            })
        }
    }


    punishments.push(...noAnswerPlayers, ...option2Players, ...option1Players)

    return {
        answers,
        punishments
    };
}
