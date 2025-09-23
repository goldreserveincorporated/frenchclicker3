import React, { useEffect, useState, useRef } from "react";
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
  faChevronDown,
  faTruck,
  faHammer,
} from "@fortawesome/free-solid-svg-icons";
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}
function formatMoney(num) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
  ];
  const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
  const item = lookup.findLast((item) => num >= item.value);
  return item
    ? (num / item.value).toFixed(2).replace(regexp, "").concat(item.symbol)
    : "0";
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
  blacktruffle: {
    name: "Black Truffle",
    rarity: "premium",
    img: "blacktruffle",
  },
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

const croissantUnlockStats = {
  chef: { cps: 1 },
  bakery: { cps: 6 },
  market: { cps: 15 },
  factory: { cps: 125 },
  industry: { cps: 450 },
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
function maxPrice(unlockPrice, money) {
  let amount = calculateMax(unlockPrice, money);
  let amountFinal = amount * unlockPrice;
  if (amountFinal != 0) {
    return amountFinal;
  } else {
    return unlockPrice;
  }
}
function buyItem(
  playerInventory,
  item,
  setInventory,
  money,
  changeMoney,
  setMarketItems,
  marketItems
) {
  if (money >= item.price) {
    changeMoney(money - item.price);
    setInventory([...playerInventory, item.name]);
    setMarketItems(marketItems.filter((i) => i.key !== item.key));
  }
}
function CroissantUnlockShop({
  unlockCounts,
  unlockPrices,
  purchaseAmt,
  onPurchase,
  addProduction,
  currentProduction,
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
                +{croissantUnlockStats[key].cps} Croissants/s
              </div>
            </div>
            <div className="amount">{unlockCounts[key]}</div>
          </div>
          <div className="buyarea">
            <div
              className="buy-btn"
              onClick={() =>
                onPurchase(
                  key,
                  unlockPrices[key],
                  addProduction,
                  currentProduction
                )
              }
            >
              Purchase{" "}
              {purchaseAmt === "Max"
                ? `Max (${calculateMax(unlockPrices[key], money)})`
                : purchaseAmt}
            </div>
            <div className="price">
              $
              {purchaseAmt === "Max"
                ? formatMoney(maxPrice(unlockPrices[key], money))
                : formatMoney(unlockPrices[key] * purchaseAmt)}
            </div>
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
                +{croissantUnlockStats[key].cps} Croissants/s
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
function RenderStore({
  items,
  playerInventory,
  setInventory,
  money,
  changeMoney,
  setMarketItems,
  marketItems,
}) {
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
          <div
            className="item-buy"
            onClick={() => {
              buyItem(
                playerInventory,
                item,
                setInventory,
                money,
                changeMoney,
                setMarketItems,
                marketItems
              );
            }}
          >
            Purchase
          </div>
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
function StatsHeader({ sc, scChange }) {
  return (
    <div className="stats-header">
      <div className="stats-select">
        <span className="stat-header">Croissants</span>
        <div
          className={sc === 1 ? "stat-change sc-selected" : "stat-change"}
          onClick={() => scChange(sc === 1 ? 0 : 1)}
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>
    </div>
  );
}
function App() {
  const [money, setMoney] = useState(100000);
  const [ProductionAmt, setProductionAmt] = useState(0);
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
  const [croissantCount, setCroissantCount] = useState(0);
  const productionAmtRef = useRef(ProductionAmt);
  const [croissantStats, setCroissantStats] = useState({
    productionSpeed: 1,
    sellSpeed: 5,
    price: 3,
    sellAmount: 50,
  });
  const [sBarKey, setsBarKey] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [pBarKey, setpBarKey] = useState(0);
  useEffect(() => {
    const sellInterval = setInterval(() => {
      console.log("sold");
      setsBarKey((prev) => prev + 1);
      setCroissantCount((prevCount) => {
        const soldAmount = prevCount;
        setMoney((prevMoney) => prevMoney + soldAmount * croissantStats.price);
        return croissantStats.sellAmount >= prevCount
          ? 0
          : prevCount - croissantStats.sellAmount;
      });
    }, croissantStats.sellSpeed * 1000);
    return () => clearInterval(sellInterval);
  }, [croissantStats]);
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
  useEffect(() => {
    productionAmtRef.current = ProductionAmt;
  }, [ProductionAmt]);
  useEffect(() => {
    const produceInterval = setInterval(() => {
      console.log("produce");
      setCroissantCount((prev) => prev + productionAmtRef.current);
      setpBarKey((prev) => prev + 1);
    }, croissantStats.productionSpeed * 1000);
    return () => clearInterval(produceInterval);
  }, [croissantStats]);

  const handlePurchase = (key, price, setProductionAmt, currentProduction) => {
    if (money < price * (purchaseAmt === "Max" ? 1 : purchaseAmt)) return;

    if (purchaseAmt === "Max") {
      const maxBuy = Math.floor(money / price);
      setMoney((m) => m - maxBuy * price);
      setUnlockCounts((prev) => ({
        ...prev,
        [key]: prev[key] + maxBuy,
      }));
      let ProductionIncrease = maxBuy * croissantUnlockStats[key].cps;
      setProductionAmt(currentProduction + ProductionIncrease);
    } else {
      setMoney((m) => m - price * purchaseAmt);
      setUnlockCounts((prev) => ({
        ...prev,
        [key]: prev[key] + purchaseAmt,
      }));
      let ProductionIncrease = purchaseAmt * croissantUnlockStats[key].cps;
      setProductionAmt(currentProduction + ProductionIncrease);
    }
  };
  const addProduction = (amount) => {
    setProductionAmt(amount);
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
              addProduction={addProduction}
              currentProduction={ProductionAmt}
              money={money}
            />
          )}
          {activeTab === 2 && (
            <RenderStore
              items={marketItems}
              playerInventory={inventory}
              setInventory={setInventory}
              changeMoney={setMoney}
              money={money}
              setMarketItems={setMarketItems}
              marketItems={marketItems}
            />
          )}
          {activeTab === 3 && <div>goon</div>}
        </div>
      </div>
      <div className="container">
        <StatsHeader sc={scSelected} scChange={setscSelected} />
        <div className="main-stats">
          <div className="main-clicker">
            <div
              className="clicker"
              onClick={() => {
                setCroissantCount(croissantCount + 1);
              }}
            >
              <div className="clicker-blue"></div>
              <div className="clicker-white"></div>
              <div className="clicker-red"></div>
            </div>
          </div>
          <div className="stat-info">
            <div className="sinfo-container">
              <div>
                Croissants <span>{croissantCount}</span>
              </div>
              <div>
                Money <span>${money}</span>
              </div>
              <div>
                Production{" "}
                <span>
                  {ProductionAmt}/
                  {croissantStats.productionSpeed === 1
                    ? ""
                    : croissantStats.productionSpeed}
                  s
                </span>
              </div>{" "}
              <div>
                Sell Rate{" "}
                <span>
                  {croissantStats.sellAmount}/{croissantStats.sellSpeed}s
                </span>
              </div>
            </div>
            <div className="progress-container delivery">
              <div className="progress-mini">
                <FontAwesomeIcon icon={faTruck} />
                <div className="progress">
                  <div
                    key={sBarKey}
                    className={"delivery-progress running"}
                    style={{
                      animationDuration: `${croissantStats.sellSpeed}s`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div
              className={
                ProductionAmt >= 1
                  ? "progress-container production"
                  : "disabled"
              }
            >
              <div className="progress-mini">
                <FontAwesomeIcon icon={faHammer} />
                <div className="progress">
                  <div
                    key={pBarKey}
                    className={
                      ProductionAmt > 0
                        ? "production-progress running"
                        : "progress-bar"
                    }
                    style={{
                      animationDuration: `${
                        1 / croissantStats.productionSpeed
                      }s`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default App;
