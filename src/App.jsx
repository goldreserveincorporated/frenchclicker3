import React, { useEffect, useState } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUnlock,
  faIndustry,
  faStore,
  faCircleUp,
} from "@fortawesome/free-solid-svg-icons";

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function shuffleStore(entries, rarityWeight) {
  return entries
    .map(([key, value]) => ({
      key,
      value,
      sortValue: Math.random() * (rarityWeight[value.rarity] || 1),
    }))
    .sort((a, b) => b.sortValue - a.sortValue)
    .map(({ key, value }) => [key, value]);
}
function priceCalculation(rarity){
  if(rarity=='common'){
    return Math.floor(Math.random() * (300 - 150) ) + 150;
  }
    if(rarity=='rare'){
    return Math.floor(Math.random() * (750 - 500) ) + 500;
  }
    if(rarity=='epic'){
    return Math.floor(Math.random() * (1500 - 1000) ) + 1000;
  }
    if(rarity=='legendary'){
    return Math.floor(Math.random() * (5000 - 4000) ) + 4000;
  }
}

const croissantPlurals = {
  chef: "Chefs",
  bakery: "Bakeries",
  market: "Markets",
  factory: "Factories",
  industry: "Industries",
};

const croissantIngredients = {
  organiccheese: { name: "Organic Cheese", rarity: "common" },
  flour: { name: "Flour", rarity: "common" },
  brownsugar: { name: "Brown Sugar", rarity: "common"},
  castorsugar: { name: "Castor Sugar", rarity: "common"},
  frenchgreysalt: { name: "French Grey Salt", rarity: "rare" },
  highqualitybutter: { name: "High-Quality Butter", rarity: "rare"},
  blacktruffle: { name: "Black Truffle", rarity: "epic" },
  whitepastry: { name: "White Pastry", rarity: "legendary"},
};

const croissantUnlockData = {
  chef: { price: 100, required: 0 },
  bakery: { price: 500, required: 5 },
  market: { price: 1000, required: 10 },
  factory: { price: 5000, required: 25 },
  industry: { price: 10000, required: 50 },
};

const croissantStats = {
  chef: { cps: 1 },
  bakery: { cps: 5 },
  market: { cps: 10 },
  factory: { cps: 50 },
  industry: { cps: 100 },
};

const rarityWeight = {
  common: 5,
  rare: 2,
  epic: 1,
  legendary: 0.5,
};

function LockedCard({ prevKey, required, unlockAmount }) {
  const remaining = required - unlockAmount[prevKey];
  return (
    <div className="locked">
      <span>
        <FontAwesomeIcon icon={faUnlock} />
        Buy {remaining} more {croissantPlurals[prevKey]} to unlock
      </span>
    </div>
  );
}

function CroissantUnlockShop({
  unlockCounts,
  unlockPrices,
  purchaseAmt,
  onPurchase,
}) {
  const entries = Object.entries(croissantUnlockData);

  // Find first locked index
  let firstLockedIndex = entries.findIndex(([key, value], index) => {
    if (index === 0) return false;
    const [prevKey] = entries[index - 1];
    return unlockCounts[prevKey] < value.required;
  });

  if (firstLockedIndex === -1) {
    firstLockedIndex = entries.length; // everything unlocked
  }

  return entries.map(([key, value], index) => {
    const isUnlocked = unlockCounts[key] >= value.required;

    // Show unlocked ones
    if (isUnlocked || index < firstLockedIndex) {
      return (
        <div className="unlock" key={key}>
          <div className="info">
            <div className="left-info">
              <span className="unlock-name">
                Croissant {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <div className="description">
                +{croissantStats[key].cps} Croissants/s
              </div>
            </div>
            <div className="amount">{unlockCounts[key]}</div>
          </div>
          <div className="buyarea">
            <div
              className="buy-btn"
              onClick={() => onPurchase(key, unlockPrices[key])}
            >
              Purchase {purchaseAmt}
            </div>
            <div className="price">${unlockPrices[key]}</div>
          </div>
        </div>
      );
    }

    if (index === firstLockedIndex) {
      const [prevKey] = entries[index - 1];
      return (
        <div className="locked-container" >
          <div className="info">
            <div className="left-info">
              <span className="unlock-name">
                Croissant {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <div className="description">
                +{croissantStats[key].cps} Croissants
              </div>
            </div>
          </div>
          <LockedCard prevKey={prevKey} required={croissantUnlockData[key].required} unlockAmount={unlockCounts}/>
          </div>

      );
    }

    return null; 
  });
}

function RenderStore({ items }) {
console.log(items)
  return (
    <>
      {items.map((item) => (
        <div className="item">
          <div className={`item-desc ${item.rarity}`}>
            <span className={`rarity ${item.rarity}-rarity`}>
              {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
            </span>
            <span className={`item-name ${item.rarity}-name`}>
              {item.name}
            </span>
            <span className={`item-price ${item.rarity}-price`}>${item.price}</span>
          </div>
          <div className="item-buy">Purchase</div>
        </div>
      ))}
    </>
  );
}

function Topbar({ activeTab, purchaseAmt, setPurchaseAmt, timeRemaining }) {
  if (activeTab === 1) {
    return (
      <div className="pa-container">
        <span>Purchase</span>
        {[1, 10, 100, "Max"].map((amt) => (
          <div
            key={amt}
            className={purchaseAmt === amt ? "selected pa-change" : "pa-change"}
            onClick={() => setPurchaseAmt(amt)}
          >
            {amt}
          </div>
        ))}
      </div>
    );
  }
  if (activeTab === 2) {
    return <span>Market Reset in: {formatTime(timeRemaining)}</span>;
  }
  if (activeTab === 3) {
    return (
      <div className="switch-tab">
        <div className="ingredients-tab">
          <span>Ingredients</span>
        </div>
        <div className="enhance-tab">
          <span>Enhancements</span>
        </div>
      </div>
    );
  }
  return null;
}

function Header({ activeTab, setActiveTab }) {
  return (
    <div className="unlock-header">
      <div
        className={activeTab === 1 ? "unlock-type uiselected" : "unlock-type"}
        onClick={() => setActiveTab(1)}
      >
        <FontAwesomeIcon icon={faIndustry} /> Production
      </div>
      <div
        className={activeTab === 2 ? "unlock-type uiselected" : "unlock-type"}
        onClick={() => setActiveTab(2)}
      >
        <FontAwesomeIcon icon={faStore} /> Market
      </div>
      <div
        className={activeTab === 3 ? "unlock-type uiselected" : "unlock-type"}
        onClick={() => setActiveTab(3)}
      >
        <FontAwesomeIcon icon={faCircleUp} /> Enhance
      </div>
    </div>
  );
}

function App() {
  const [money, setMoney] = useState(10000);
  const [activeTab, setActiveTab] = useState(1);
  const [purchaseAmt, setPurchaseAmt] = useState(1);

  const [unlockCounts, setUnlockCounts] = useState({
    chef: 0,
    bakery: 0,
    market: 0,
    factory: 0,
    industry: 0,
  });

  const [unlockPrices] = useState({
    chef: 100,
    bakery: 500,
    market: 1000,
    factory: 5000,
    industry: 10000,
  });

  const [marketItems, setMarketItems] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(120);

  useEffect(() => {
    const resetMarket = () => {
      const entries = Object.entries(croissantIngredients);
      const newItems = shuffleStore(entries, rarityWeight).slice(0, 4).map(([key, value]) => ({
      key,
      ...value,
      price: priceCalculation(value.rarity)
    }));
      console.log(newItems)
      setMarketItems(newItems);
      setTimeRemaining(120);
    };

    resetMarket();

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          resetMarket();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePurchase = (key, price) => {
    if (money < price * (purchaseAmt === "Max" ? 1 : purchaseAmt)) return;

    if (purchaseAmt === "Max") {
      const maxBuy = Math.floor(money / price);
      setMoney((m) => m - maxBuy * price);
      setUnlockCounts((prev) => ({
        ...prev,
        [key]: prev[key] + maxBuy,
      }));
    } else {
      setMoney((m) => m - price * purchaseAmt);
      setUnlockCounts((prev) => ({
        ...prev,
        [key]: prev[key] + purchaseAmt,
      }));
    }
  };

  return (
    <div className="unlock-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="topbar-unlock">
        <Topbar
          activeTab={activeTab}
          purchaseAmt={purchaseAmt}
          setPurchaseAmt={setPurchaseAmt}
          timeRemaining={timeRemaining}
        />
      </div>
      <div className="main-unlock">
        {activeTab === 1 && (
          <CroissantUnlockShop
            unlockCounts={unlockCounts}
            unlockPrices={unlockPrices}
            purchaseAmt={purchaseAmt}
            onPurchase={handlePurchase}
          />
        )}
        {activeTab === 2 && (
          <RenderStore items={marketItems} timeRemaining={timeRemaining} />
        )}
        {activeTab === 3 && <div>ENIGGER</div>}
      </div>
    </div>
  );
}

export default App;
