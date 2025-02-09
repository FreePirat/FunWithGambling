let deck = [];
let playerHand = [];
let dealerHand = [];
let playerCoins = 100;
let gameOver = false;

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

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function dealCard() {
    return deck.pop();
}

function getHandValue(hand) {
    let value = 0;
    let aceCount = 0;
    
    for (let card of hand) {
        if (["J", "Q", "K"].includes(card.value)) {
            value += 10;
        } else if (card.value === "A") {
            aceCount++;
            value += 11;
        } else {
            value += parseInt(card.value);
        }
    }
    
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    
    return value;
}

function updateUI() {
    document.getElementById("chips").textContent = playerCoins;
    document.getElementById("player-hand").innerHTML = displayCards(playerHand);
    document.getElementById("player-hand-value").innerText = `Hand Value: ${getHandValue(playerHand)}`;
    
    if (gameOver) {
        document.getElementById("dealer-hand").innerHTML = displayCards(dealerHand);
        document.getElementById("dealer-title").innerText = "Dealer's Hand";
        document.getElementById("dealer-hand-value").innerText = `Hand Value: ${getHandValue(dealerHand)}`;
    } else {
        document.getElementById("dealer-hand").innerHTML = displayCards([dealerHand[0], { value: "?", suit: "?" }]);
        document.getElementById("dealer-title").innerText = "Dealer's Hand";
        document.getElementById("dealer-hand-value").innerText = "";
    }
}

function startGame() {
    if (playerCoins < 20) {
        alert("You do not have enough coins to play");
        return;
    }
    
    playerCoins -= 20;
    deck = createDeck();
    playerHand = [dealCard(), dealCard()];
    dealerHand = [dealCard(), dealCard()];
    gameOver = false;
    
    document.getElementById("hit").disabled = false;
    document.getElementById("stand").disabled = false;
    document.getElementById("start-button").style.display = "none";
    document.getElementById("game-area").classList.remove("hidden");
    document.getElementById("hit").classList.remove("hidden");
    document.getElementById("stand").classList.remove("hidden");
    
    updateUI();
}

function hit() {
    if (gameOver) return;
    playerHand.push(dealCard());
    updateUI();
    
    if (getHandValue(playerHand) > 21) {
        endGame();
    }
}

function stand() {
    if (gameOver) return;
    gameOver = true;
    
    while (getHandValue(dealerHand) < 17) {
        dealerHand.push(dealCard());
    }
    
    endGame();
}

function endGame() {
    updateUI();
    
    let playerValue = getHandValue(playerHand);
    let dealerValue = getHandValue(dealerHand);
    
    let message = "";
    if (playerValue > 21) {
        message = "You busted! Dealer wins.";
    } else if (dealerValue > 21 || playerValue > dealerValue) {
        message = "You win!";
        playerCoins += 40;
    } else if (playerValue < dealerValue) {
        message = "Dealer wins!";
    } else {
        message = "It's a tie!";
        playerCoins += 20;
    }
    
    setTimeout(() => {
        alert(message);
        resetGame();
    }, 1000);
}

function resetGame() {
    document.getElementById("hit").disabled = true;
    document.getElementById("stand").disabled = true;
    
    setTimeout(() => {
        playerHand = [];
        dealerHand = [];
        document.getElementById("start-button").style.display = "block";
        document.getElementById("game-area").classList.add("hidden");
        updateUI();
    }, 1000);
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
