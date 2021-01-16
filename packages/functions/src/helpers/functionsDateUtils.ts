export function twoDaysAgoFactory() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);

    return threeDaysAgo;
}

export function threeDaysAgoFactory() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return threeDaysAgo;
}
