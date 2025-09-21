import React, { useEffect, useState } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUnlock,
  faIndustry,
  faStore,
  faCircleUp,
  faRotateRight,
  faCircle,
  faStar,
  faDiamond,
  faChevronDown
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
function priceCalculation(rarity) {
  if (rarity == "basic") {
    return Math.floor(Math.random() * (300 - 150)) + 150;
  }
  if (rarity == "premium") {
    return Math.floor(Math.random() * (750 - 500)) + 500;
  }
  if (rarity == "deluxe") {
    return Math.floor(Math.random() * (5000 - 4000)) + 4000;
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
  cheese: { name: "Cheese", rarity: "basic", img: "cheese" },
  flour: { name: "Wheat Flour", rarity: "basic", img: "flour" },
  sugar: { name: "Caster Sugar", rarity: "basic", img: "sugar" },
  salt: { name: "French Salt", rarity: "basic", img: "salt" },
  butter: { name: "Butter", rarity: "basic", img: "butter" },
  blacktruffle: { name: "Black Truffle", rarity: "premium", img: "blacktruffle" },
  puffpastry: { name: "Puff Pastry", rarity: "basic", img: "pastry" },
  whitetruffle: {
    name: "White Truffle",
    rarity: "deluxe",
    img: "whitetruffle",
  },
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
  basic: 5,
  premium: 5,
  deluxe: 5,
};
function calculateMax(price, money) {
  if (money != 0) {
    let amount = Math.floor(money / price);
    return amount;
  } else {
    return 0;
  }
}
function LockedCard({ prevKey, required, unlockAmount }) {
  const remaining = required - unlockAmount[prevKey];
  return (
    <div className="locked">
      <div>
        <FontAwesomeIcon icon={faUnlock} />
        Buy {remaining} more {croissantPlurals[prevKey]} to unlock
      </div>
    </div>
  );
}

function CroissantUnlockShop({
  unlockCounts,
  unlockPrices,
  purchaseAmt,
  onPurchase,
  money,
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
              Purchase{" "}
              {purchaseAmt === "Max"
                ? `Max (${calculateMax(unlockPrices[key], money)})`
                : purchaseAmt}
            </div>
            <div className="price">${unlockPrices[key]}</div>
          </div>
        </div>
      );
    }

    if (index === firstLockedIndex) {
      const [prevKey] = entries[index - 1];
      return (
        <div className=" unlock">
          <div className="info">
            <div className="left-info">
              <span className="unlock-name">
                Croissant {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <div className="description">
                +{croissantStats[key].cps} Croissants/s
              </div>
            </div>
          </div>
          <LockedCard
            prevKey={prevKey}
            required={croissantUnlockData[key].required}
            unlockAmount={unlockCounts}
          />
        </div>
      );
    }

    return null;
  });
}

function getRarityIcon(rarity) {
  if (rarity == "basic") {
    return faCircle;
  }
  if (rarity == "premium") {
    return faDiamond;
  }
  if (rarity == "deluxe") {
    return faStar;
  }
}
function RenderStore({ items }) {
  return (
    <>
      {items.map((item) => (
        <div className="item">
          <div className={`item-desc ${item.rarity}`}>
            <div className="item-info">
              <span className={`item-name ${item.rarity}-name`}>
                {item.name}
              </span>
              <div className={`rarity ${item.rarity}-rarity`}>
                <FontAwesomeIcon
                  className="rarity-icon"
                  icon={getRarityIcon(item.rarity)}
                />
                {String(item.rarity).charAt(0).toUpperCase() +
                  String(item.rarity).slice(1)}
              </div>
            </div>
            <span className={`item-price ${item.rarity}-price`}>
              ${item.price}
            </span>
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
    return <span>Market Reset in {formatTime(timeRemaining)}</span>;
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
function StatsHeader({sc, scChange}) {
  console.log(sc)
  return (
    <div className="stats-header">
      <div className="stats-select">
        <span className="stat-header">Croissants</span>
        <div className={sc===1?"stat-change sc-selected":"stat-change"} onClick={()=>scChange(sc===1?0:1)}><FontAwesomeIcon icon={faChevronDown} /></div>
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
  const [scSelected, setscSelected] = useState(0);
  useEffect(() => {
    const resetMarket = () => {
      const entries = Object.entries(croissantIngredients);
      const newItems = shuffleStore(entries, rarityWeight)
        .slice(0, 4)
        .map(([key, value]) => ({
          key,
          ...value,
          price: priceCalculation(value.rarity),
        }));
      console.log(newItems);
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
    <>
    <div className="container">
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
            money={money}
          />
        )}
        {activeTab === 2 && (
          <RenderStore items={marketItems} timeRemaining={timeRemaining} />
        )}
        {activeTab === 3 && <div>goon</div>}
      </div>
    </div>
<div className="container">
   <StatsHeader sc={scSelected} scChange = {setscSelected}/>
   <div className="main-stats"></div>
    </div>
    </>
      )
    }
export default App;
