// Define a custom return type for game-related operations
export type OperationResult<T> = {
    success: boolean;
    data?: T;
    error?: string;
};


