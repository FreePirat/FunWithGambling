let deck = [];
let playerHand = [];
let dealerHand = [];
let communityCards = [];
let playerCoins = 100;
let pot = 0;
let minBet = 10;
let gameStage = 0;

function createDeck() {
    let suits = ["hearts", "diamonds", "clubs", "spades"];
    let values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    let newDeck = [];
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({ value, suit });
        }
    }
    return shuffleDeck(newDeck);
}

function displayCards(cards) {
    return `
        <div class="card-container">
            ${cards.map(card => {
                const suit = getSuitEmoji(card.suit);
                return `
                    <div class="card">
                        <div class="suit-top">${suit}</div>
                        <div class="card-number">${card.value}</div>
                        <div class="suit-bottom">${suit}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function getSuitEmoji(suit) {
    switch (suit) {
        case 'hearts': return '♥️';
        case 'diamonds': return '♦️';
        case 'clubs': return '♣️';
        case 'spades': return '♠️';
        default: return '?';
    }
}

function updateUI() {
    document.getElementById("chips").textContent = playerCoins;
    document.getElementById("player-hand").innerHTML = displayCards(playerHand);
    if (gameStage < 1) {
        document.getElementById("community-cards").innerHTML = "<p>Community cards will be revealed soon...</p>";
    } else {
        document.getElementById("community-cards").innerHTML = displayCards(communityCards.slice(0, gameStage + 2));
    }
    if (gameStage < 3) {
        document.getElementById("dealer-hand").innerHTML = "";
        document.getElementById("dealer-title").innerHTML = "";
    } else {
        document.getElementById("dealer-hand").innerHTML = displayCards(dealerHand);
        document.getElementById("dealer-title").innerHTML = "Dealer's Cards";
    }
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function startGame() {

    if(playerCoins === 0){
        alert("You do not have enough coins to play");
    }
    else{
        deck = createDeck();
        playerHand = [dealCard(), dealCard()];
        dealerHand = [dealCard(), dealCard()];
        communityCards = [dealCard(), dealCard(), dealCard(), dealCard(), dealCard()];
        pot = 0;
        gameStage = 0;

        document.getElementById("call-button").disabled = false;
        document.getElementById("bet-button").disabled = false;
        document.getElementById("fold-button").disabled = false;

        document.getElementById("start-button").style.display = "none";
        document.getElementById("game-area").classList.remove("hidden");

        document.getElementById("player-hand").innerHTML = "";
        document.getElementById("dealer-hand").innerHTML = "";
        document.getElementById("dealer-title").innerHTML = "";
        document.getElementById("community-cards").innerHTML = "";

        document.getElementById("call-button").classList.remove("hidden");
        document.getElementById("bet-button").classList.remove("hidden");
        document.getElementById("fold-button").classList.remove("hidden");

        updateUI();
    }
}

function dealCard() {
    return deck.pop();
}

function placeBet(amount) {
    if (amount > playerCoins) {
        alert("Not enough chips!");
        return;
    }
    playerCoins -= amount;
    pot += amount * 2;

    if (playerCoins === 0) {
        goAllIn();
    } else {
        nextRound();
    }
}

function promptBet() {
    let amount = parseInt(prompt("Enter your bet amount:"));
    if (!isNaN(amount) && amount > 0) {
        placeBet(amount);
    } else {
        alert("Invalid bet.");
    }
}

function foldGame() {
    alert("You folded. Dealer wins!");
    pot = 0;
    resetGame();
}

function nextRound() {
    gameStage++;

    if (gameStage === 1) {
        document.getElementById("community-cards").innerHTML = displayCards(communityCards.slice(0, 3));
    } else if (gameStage === 2) {
        document.getElementById("community-cards").innerHTML = displayCards(communityCards.slice(0, 4));
    } else if (gameStage === 3) {
        document.getElementById("community-cards").innerHTML = displayCards(communityCards);
        showdown();
    }

    updateUI();
}

function evaluateHand(cards) {
    let ranks = cards.map(card => card.value);
    let suits = cards.map(card => card.suit);

    let values = ranks.map(val => (val === "A" ? 14 : val === "K" ? 13 : val === "Q" ? 12 : val === "J" ? 11 : parseInt(val)));
    values.sort((a, b) => b - a); // Sort highest to lowest

    let counts = {};
    values.forEach(val => counts[val] = (counts[val] || 0) + 1);
    let pairs = Object.values(counts).filter(count => count === 2).length;
    let triples = Object.values(counts).filter(count => count === 3).length;
    let quads = Object.values(counts).filter(count => count === 4).length;

    let suitCount = {};
    cards.forEach(card => {
        suitCount[card.suit] = (suitCount[card.suit] || []).concat(card);
    });

    let flushCards = Object.values(suitCount).find(suitGroup => suitGroup.length >= 5);
    let isFlush = !!flushCards;

    let uniqueValues = [...new Set(values)];
    uniqueValues.sort((a, b) => b - a);

    let isStraight = false;
    for (let i = 0; i <= uniqueValues.length - 5; i++) {
        if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
            isStraight = true;
            break;
        }
    }

    let isStraightFlush = false;
    if (isFlush && flushCards.length >= 5) {
        let flushValues = flushCards.map(card => card.value)
            .map(val => (val === "A" ? 14 : val === "K" ? 13 : val === "Q" ? 12 : val === "J" ? 11 : parseInt(val)))
            .sort((a, b) => b - a);

        for (let i = 0; i <= flushValues.length - 5; i++) {
            if (flushValues[i] - flushValues[i + 4] === 4) {
                isStraightFlush = true;
                break;
            }
        }
    }

    if (isStraightFlush) return { rank: "Straight Flush", value: 8 };
    if (quads) return { rank: "Four of a Kind", value: 7 };
    if (triples && pairs) return { rank: "Full House", value: 6 };
    if (isFlush) return { rank: "Flush", value: 5 };
    if (isStraight) return { rank: "Straight", value: 4 };
    if (triples) return { rank: "Three of a Kind", value: 3 };
    if (pairs === 2) return { rank: "Two Pair", value: 2 };
    if (pairs === 1) return { rank: "One Pair", value: 1 };

    return { rank: "High Card", value: 0 }; // Default to high card
}



function showdown() {
    let playerBestHand = evaluateHand([...playerHand, ...communityCards]);
    let dealerBestHand = evaluateHand([...dealerHand, ...communityCards]);

    console.log(`Player has: ${playerBestHand.rank}`);
    console.log(`Dealer has: ${dealerBestHand.rank}`);

    document.getElementById("dealer-hand").innerHTML = displayCards(dealerHand);
    document.getElementById("dealer-title").innerHTML = "Dealer's Cards";

    if (playerBestHand.value > dealerBestHand.value) {
        setTimeout(() => {
            alert(`Player wins with ${playerBestHand.rank}!`);
        }, 2000);
        playerCoins += pot;
    } else if (playerBestHand.value < dealerBestHand.value) {
        setTimeout(() => {
            alert(`Dealer wins with ${dealerBestHand.rank}!`);
        }, 2000);
    } else {
        setTimeout(() => {
            alert("It's a tie!");
        }, 2000);
        playerCoins += (pot / 2);
    }
    pot = 0;
    resetGame();
}


function resetGame() {

    document.getElementById("call-button").disabled = true;
    document.getElementById("bet-button").disabled = true;
    document.getElementById("fold-button").disabled = true;

    setTimeout(() => {

        playerHand = [];
        dealerHand = [];
        communityCards = [];
        pot = 0;
        gameStage = 0;

        document.getElementById("start-button").style.display = "block";
        document.getElementById("game-area").classList.add("hidden");

        document.getElementById("player-hand").innerHTML = "";
        document.getElementById("dealer-hand").innerHTML = "";
        document.getElementById("dealer-title").innerHTML = "";
        document.getElementById("community-cards").innerHTML = "";

        updateUI();
    }, 2000);
}

function goAllIn() {
    gameStage = 3;
    updateUI();

    setTimeout(() => {
        showdown();
    }, 1000);
}
