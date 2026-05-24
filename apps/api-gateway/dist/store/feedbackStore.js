const feedbackEntries = [];
const ratingClicks = {};
export function addRatingClick(rating) {
    ratingClicks[rating] = (ratingClicks[rating] ?? 0) + 1;
}
export function getRatingClicks() {
    return ratingClicks;
}
export function addFeedback(entry) {
    const created = { ...entry, timestamp: new Date().toISOString() };
    feedbackEntries.unshift(created);
    return created;
}
export function listFeedback(rating) {
    if (typeof rating === "number") {
        return feedbackEntries.filter((entry) => entry.rating === rating);
    }
    return feedbackEntries;
}
