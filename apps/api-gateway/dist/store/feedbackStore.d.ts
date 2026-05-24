export type FeedbackEntry = {
    rating: number;
    name: string;
    phone: string;
    email?: string;
    reason: string;
    comments: string;
    timestamp: string;
};
export declare function addRatingClick(rating: number): void;
export declare function getRatingClicks(): Record<number, number>;
export declare function addFeedback(entry: Omit<FeedbackEntry, "timestamp">): FeedbackEntry;
export declare function listFeedback(rating?: number): FeedbackEntry[];
