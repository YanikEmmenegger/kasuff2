import React, {createContext, useContext, useEffect, useState} from 'react';
import axios, {AxiosError} from 'axios';
import {v4 as uuidv4} from 'uuid';
import {AvatarType, Player} from '../types';
import {defaultAvatar} from "../components/avatar/variants.ts";

interface UserContextType {
    player: Player | null;
    updateUserName: (newName: string) => Promise<boolean>;
    updateUserSocketId: (socketId: string) => Promise<boolean>;
    updateUserGameCode: (gameCode: string) => Promise<boolean>;
    updateUserAvatar: (avatar: AvatarType) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [player, setPlayer] = useState<Player | null>(null);

    // Synchronize local storage with the state whenever `player` is updated
    useEffect(() => {
        if (player) {
            localStorage.setItem('user', JSON.stringify(player));
        }
    }, [player]);

    useEffect(() => {
        const checkOrCreateUser = async () => {
            const localUser = localStorage.getItem('user');
            if (localUser) {
                const user = JSON.parse(localUser);
                const uuid = user.uuid;
                try {
                    const response = await axios.get(`http://localhost:5001/players/${uuid}`);
                    const fetchedPlayer = response.data.player;

                    // If the player has no avatar, set a default avatar and update in backend
                    if (fetchedPlayer.avatar === null) {
                        console.log('User does not have an avatar, creating one now');
                        fetchedPlayer.avatar = defaultAvatar;
                        await axios.put(`http://localhost:5001/players/${uuid}`, {
                            avatar: defaultAvatar,
                        });
                    }

                    setPlayer(fetchedPlayer);
                    localStorage.setItem('user', JSON.stringify(fetchedPlayer));
                    console.log('Fetched player:', fetchedPlayer);
                } catch (error: AxiosError | any) {
                    console.error(error);
                    if (error.response?.status === 404) {
                        localStorage.removeItem('user');
                        createNewUser();
                    }
                }
            } else {
                createNewUser();
            }
        };

        const createNewUser = async () => {
            const newUuid = uuidv4();
            const randomName = `User-${Math.floor(Math.random() * 1000000)}`;
            try {
                const response = await axios.post('http://localhost:5001/players', {
                    uuid: newUuid,
                    name: randomName,
                    avatar: defaultAvatar,
                });
                const newPlayer = response.data.player;
                setPlayer(newPlayer);
            } catch (error) {
                console.error('Error creating new player:', error);
            }
        };

        checkOrCreateUser();
    }, []);

    // Function to update user name
    const updateUserName = async (newName: string) => {
        if (!player) return false;

        try {
            const response = await axios.put(`http://localhost:5001/players/${player.uuid}`, {
                name: newName,
            });

            const updatedPlayer = response.data.player;
            setPlayer(updatedPlayer);
            return true;
        } catch (error) {
            console.error('Error updating user name:', error);
            return false;
        }
    };

    const updateUserSocketId = async (socketId: string) => {
        if (!player) return false;

        try {
            const response = await axios.put(`http://localhost:5001/players/${player.uuid}`, {
                socketId: socketId,
            });

            const updatedPlayer = response.data.player;
            setPlayer(updatedPlayer);
            return true;
        } catch (error) {
            console.error('Error updating user socketId:', error);
            return false;
        }
    };

    const updateUserGameCode = async (gameCode: string) => {
        if (!player) return false;

        try {
            const response = await axios.put(`http://localhost:5001/players/${player.uuid}`, {
                gameCode: gameCode,
            });

            const updatedPlayer = response.data.player;
            setPlayer(updatedPlayer);
            return true;
        } catch (error) {
            console.error('Error updating user gameCode:', error);
            return false;
        }
    };

    const updateUserAvatar = async (avatar: AvatarType) => {
        if (!player) return false;

        try {
            const response = await axios.put(`http://localhost:5001/players/${player.uuid}`, {
                avatar: avatar,
            });

            const updatedPlayer = response.data.player;
            setPlayer(updatedPlayer);
            return true;
        } catch (error) {
            console.error('Error updating user avatar:', error);
            return false;
        }
    }

    return (
        <UserContext.Provider
            value={{player, updateUserName, updateUserSocketId, updateUserGameCode, updateUserAvatar}}>
            {children}
        </UserContext.Provider>
    );
};

// Export `useUser` as a named export
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};

export default UserProvider;
