export interface Player {
    uuid: string;
    name: string;
    avatar: AvatarType;
    points: number;
    gameCode: string | null;
    socketId: string | null;
}

export interface AvatarPart {
    variant: number;  // Now a number (index)
    color: number;    // Now a number (index)
}

export interface AvatarType {
    hat: AvatarPart;
    face: AvatarPart;
    body: AvatarPart;
    pants: AvatarPart;
}
