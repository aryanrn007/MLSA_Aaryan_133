export class Leaderboard {
    constructor(storageKey = 'quiz_leaderboard') {
        this.storageKey = storageKey;
    }

    getScores() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error reading leaderboard data", error);
            return [];
        }
    }

    addScore(name, score, difficulty) {
        const scores = this.getScores();
        scores.push({
            name: name || "Anonymous",
            score: score,
            difficulty: difficulty,
            date: new Date().toISOString()
        });
        
        // Sort in descending order based on score
        scores.sort((a, b) => b.score - a.score);
        
        // Keep top 10
        const topScores = scores.slice(0, 10);
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(topScores));
        } catch (error) {
            console.error("Error saving leaderboard data", error);
        }
    }
}
