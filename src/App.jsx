import React, { useEffect, useState, useRef, act } from "react";
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
  faCaretUp,
  faHammer,
  faClock,
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

function shuffleMarket(entries, rarityWeight) {
  return entries
    .map(([key, value]) => ({
      key,
      value,
      sortValue: Math.random() * (rarityWeight[value.rarity] || 1),
    }))
    .sort((a, b) => b.sortValue - a.sortValue)
    .map(({ key, value }) => [key, value]);
}

function calculatePbyR(rarity) {
  if (rarity === "basic") {
    return Math.floor(Math.random() * (300 - 150)) + 150;
  }
  if (rarity === "premium") {
    return Math.floor(Math.random() * (1500 - 800)) + 800;
  }
  if (rarity === "deluxe") {
    return Math.floor(Math.random() * (6000 - 4000)) + 4000;
  }
}

function calculateMaxPurchase(price, money) {
  return money !== 0 ? Math.floor(money / price) : 0;
}

function calculateTotalPrice(unlockPrice, money) {
  const amount = calculateMaxPurchase(unlockPrice, money);
  const total = amount * unlockPrice;
  return total !== 0 ? total : unlockPrice;
}

function groupInventoryItems(inventory) {
  const grouped = {};
  inventory.forEach((item) => {
    const key = item.key;
    if (!grouped[key]) {
      grouped[key] = { ...item, amount: 1 };
    } else {
      grouped[key].amount += 1;
    }
  });
  return Object.values(grouped);
}

function getIngredientAmount(inventory, ingredient) {
  const groupedInventory = groupInventoryItems(inventory);
  const found = groupedInventory.find((i) => i.key === ingredient.key);
  return found ? found.amount : 0;
}

const enhancementPrices = {
  sell: {
    l1: [{ key: "salt", amount: 1 }],
    l2: [
      { key: "butter", amount: 2 },
      { key: "flour", amount: 3 },
      { key: "sugar", amount: 4 },
      { key: "milk", amount: 2 },
    ],
    l3: [
      { key: "butter", amount: 5 },
      { key: "panela", amount: 1 },
      { key: "flour", amount: 3 },
      { key: "milk", amount: 5 },
    ],
  },
  produce: {
    l1: [{ key: "salt", amount: 1 }],
  },
  expensive: {
    l1: [{ key: "salt", amount: 1 }],
    l2: [
      { key: "butter", amount: 1 },
      { key: "sugar", amount: 1 },
    ],
  },
};

const enhancementEffects = {
  sell: {
    l1: { display: "1.5x Sell Rate", effect: 1.5, duration: 60 },
    l2: { display: "2x Sell Rate", effect: 2, duration: 60 },
    l3: { display: "3x Sell Rate", effect: 2.5, duration: 120 },
    l4: {
      display: ["3x Sell Rate", "-25% Sell Time"],
      effect: 3,
      duration: 150,
    },
    l5: {
      display: ["5x Sell Rate", "-50% Sell Time"],
      effect: 5,
      duration: 210,
    },
  },
  produce: {
    l1: { display: "1.2x Production", effect: 1.2, duration: 60 },
    l2: { display: "1.5x Production", effect: 1.5, duration: 60 },
    l3: { display: "2x Production", effect: 2, duration: 120 },
  },
  expensive: {
    l1: { display: "+$1 Sell Price", effect: 1, duration: 60 },
    l2: { display: "+$2 Sell Price", effect: 2, duration: 60 },
    l3: { display: "+$3 Sell Price", effect: 3, duration: 120 },
    l4: { display: "+$5 Sell Price", effect: 5, duration: 120 },
    l5: { display: "+$10 Sell Price", effect: 6, duration: 300 },
  },
};

const enhancements = [
  {
    key: "sell",
    price: enhancementPrices.sell.l1,
    effect: enhancementEffects.sell.l1,
    name: "Tastier Croissants",
  },
  {
    key: "produce",
    price: enhancementPrices.produce.l1,
    effect: enhancementEffects.produce.l1,
    name: "Higher Production",
  },
  {
    key: "expensive",
    price: enhancementPrices.expensive.l1,
    effect: enhancementEffects.expensive.l1,
    name: "Expensive Croissants",
  },
];

const croissantPlurals = {
  chef: "Chefs",
  bakery: "Bakeries",
  market: "Markets",
  factory: "Factories",
  industry: "Industries",
};

const ingredients = {
  flour: { name: "Wheat Flour", rarity: "basic", img: "flour" },
  sugar: { name: "Caster Sugar", rarity: "basic", img: "sugar" },
  salt: { name: "Kosher Salt", rarity: "basic", img: "salt" },
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
  milk: { name: "Milk", rarity: "basic", img: "milk" },
  saffron: { name: "Saffron", rarity: "deluxe", img: "saffron" },
  panela: { name: "Panela Sugar", rarity: "premium", img: "panela" },
  bamboosalt: { name: "Bamboo Salt", rarity: "premium", img: "bluesalt" },
};

const croissantUnlockData = {
  chef: { price: 100, required: 0 },
  bakery: { price: 500, required: 5 },
  market: { price: 1000, required: 10 },
  factory: { price: 5000, required: 25 },
  industry: { price: 10000, required: 50 },
};

const rarityWeight = {
  basic: 5,
  premium: 5,
  deluxe: 5,
};

function getRarityIcon(rarity) {
  if (rarity === "basic") return faCircle;
  if (rarity === "premium") return faDiamond;
  if (rarity === "deluxe") return faStar;
}

function Locked({ prevKey, required, unlockAmount }) {
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

function UnlockShop({
  unlockAmount,
  unlockPrices,
  purchaseAmount,
  onPurchase,
  addProduction,
  currentProduction,
  money,
  croissantStatsTable,
}) {
  const entries = Object.entries(croissantUnlockData);
  let firstLockedIndex = entries.findIndex(([key, value], index) => {
    if (index === 0) return false;
    const [prevKey] = entries[index - 1];
    return unlockAmount[prevKey] < value.required;
  });

  if (firstLockedIndex === -1) firstLockedIndex = entries.length;

  return entries.map(([key, value], index) => {
    const isUnlocked = unlockAmount[key] >= value.required;

    if (isUnlocked || index < firstLockedIndex) {
      return (
        <div className="unlock" key={key}>
          <div className="info">
            <div className="left-info">
              <span className="unlock-name">
                Croissant {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <div className="description">
                +{croissantStatsTable[key].cps} Croissants/s
              </div>
            </div>
            <div className="amount">{unlockAmount[key]}</div>
          </div>
          <div className="buyarea">
            <div
              className="buy-btn"
              onClick={() =>
                onPurchase(
                  key,
                  unlockPrices[key],
                  addProduction,
                  currentProduction,
                  croissantStatsTable
                )
              }
            >
              Purchase{" "}
              {purchaseAmount === "Max"
                ? `Max (${calculateMaxPurchase(unlockPrices[key], money)})`
                : purchaseAmount}
            </div>
            <div className="price">
              $
              {purchaseAmount === "Max"
                ? formatMoney(calculateTotalPrice(unlockPrices[key], money))
                : formatMoney(unlockPrices[key] * purchaseAmount)}
            </div>
          </div>
        </div>
      );
    }

    if (index === firstLockedIndex) {
      const [prevKey] = entries[index - 1];
      return (
        <div className="unlock" key={key}>
          <div className="info">
            <div className="left-info">
              <span className="unlock-name">
                Croissant {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <div className="description">
                +{croissantStatsTable[key].cps} Croissants/s
              </div>
            </div>
          </div>
          <Locked
            prevKey={prevKey}
            required={croissantUnlockData[key].required}
            unlockAmount={unlockAmount}
          />
        </div>
      );
    }

    return null;
  });
}

function MarketStore({
  items,
  playerInventory,
  setInventory,
  money,
  changeMoney,
  setMarketItems,
  marketItems,
}) {
  if (items.length === 0) {
    return <div className="empty-text">🤑</div>;
  }
  return (
    <>
      {items.map((item) => (
        <div className="item" key={item.key}>
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
                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
              </div>
            </div>
            <span className={`item-price ${item.rarity}-price`}>
              ${item.price}
            </span>
          </div>
          <div
            className="item-buy"
            onClick={() => {
              handleBuyItem(
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

function IngredientsList({ playerInventory }) {
  const groupedInventory = groupInventoryItems(playerInventory);
  if (groupedInventory.length === 0) {
    return <div className="empty-text">😞</div>;
  }
  return (
    <>
      {groupedInventory.map((ingredient) => (
        <div
          className={`inv-${ingredient.rarity} inv-item`}
          key={ingredient.key}
        >
          <div className={`item-desc`}>
            <div className="item-info">
              <span className={`item-name ${ingredient.rarity}-name`}>
                {ingredient.name}
              </span>
              <div className={`rarity ${ingredient.rarity}-rarity`}>
                <FontAwesomeIcon
                  className="rarity-icon"
                  icon={getRarityIcon(ingredient.rarity)}
                />
                {ingredient.rarity.charAt(0).toUpperCase() +
                  ingredient.rarity.slice(1)}
              </div>
            </div>
            <span className={`item-amount ${ingredient.rarity}-amount`}>
              {ingredient.amount}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

function EnhancementRecipe({ enhancement, inventory }) {
  return enhancement.map((ingredient) => (
    <div
      className={`enhancement-ingredient ${
        ingredients[ingredient.key].rarity
      }-ingredient`}
      key={ingredient.key}
    >
      <div className="ingredient">{ingredients[ingredient.key].name}</div>
      <div className={`${ingredients[ingredient.key].rarity}-idivider`}></div>
      <span
        className={`${
          getIngredientAmount(inventory, ingredient) >= ingredient.amount
            ? ""
            : `ecost-${ingredients[ingredient.key].rarity}`
        }`}
      >
        {getIngredientAmount(inventory, ingredient)}/{ingredient.amount}
      </span>
    </div>
  ));
}
function displayEffects(effects) {
  if (Array.isArray(effects)) {
    return effects.map((effect, index) => <span key={index}>{effect}</span>);
  } else {
    return <span>{effects}</span>;
  }
}
function activateEnhancement(
  enhancement,
  setCroissantStats,
  setProductionAmount
) {
  if (enhancement.key == "expensive") {
    setCroissantStats((prev) => ({
      ...prev,
      price: prev.price + enhancement.effect.effect,
    }));
  }
  if (enhancement.key == "sell") {
    setCroissantStats((prev) => ({
      ...prev,
      sellAmount: Math.round(prev.sellAmount * enhancement.effect.effect),
    }));
  }
  if (enhancement.key == "produce") {
    setProductionAmount((prev) => ({
      ...prev,
      multiplier: prev.multiplier * enhancement.effect.effect,
    }));
  }
}
function craftEnhancement(
  inventory,
  enhancement,
  setInventory,
  setCroissantStats,
  setProductionAmount
) {
  const groupedInventory = groupInventoryItems(inventory);
  let canCraft = true;

  for (const req of enhancement.price) {
    const invItem = groupedInventory.find((i) => i.key === req.key);
    if (!invItem || invItem.amount < req.amount) {
      canCraft = false;
      break;
    }
  }

  if (!canCraft) {
    return;
  }

  let updatedInventory = [...inventory];
  for (const req of enhancement.price) {
    let toRemove = req.amount;
    updatedInventory = updatedInventory.filter((item) => {
      if (item.key === req.key && toRemove > 0) {
        toRemove -= 1;
        return false;
      }
      return true;
    });
  }
  setInventory(updatedInventory);
  activateEnhancement(enhancement, setCroissantStats, setProductionAmount);
}
function EnhancementsList({
  playerInventory,
  setInventory,
  setCroissantStats,
  setProductionAmount,
}) {
  return enhancements.map((enhancement) => (
    <div className="enhancement" key={enhancement.name}>
      <div className="enhancement-tinfo">
        <div className="enhancement-desc">
          <span className="enhancement-name">{enhancement.name}</span>
          <span className={`${enhancement.key} einfo`}>
            <FontAwesomeIcon icon={faCaretUp} className="up" />{" "}
            <div className="enhancement-effects">
              {displayEffects(enhancement.effect.display)}
            </div>
          </span>
        </div>
        <div className="enhancement-cost">
          <span className="ingredients-header">Recipe</span>
          <EnhancementRecipe
            enhancement={enhancement.price}
            inventory={playerInventory}
          />
        </div>
      </div>
      <div
        className="activate-btn"
        onClick={() =>
          craftEnhancement(
            playerInventory,
            enhancement,
            setInventory,
            setCroissantStats,
            setProductionAmount
          )
        }
      >
        Craft {`(Lasts ${enhancement.effect.duration}s)`}
      </div>
    </div>
  ));
}

function TopBar({
  activeTab,
  purchaseAmount,
  setPurchaseAmount,
  timeRemaining,
  ieSelected,
  setIeSelected,
}) {
  if (activeTab === 1) {
    return (
      <div className="pa-container">
        <span>Purchase</span>
        {[1, 10, 100, "Max"].map((amt) => (
          <div
            key={amt}
            className={
              purchaseAmount === amt ? "selected pa-change" : "pa-change"
            }
            onClick={() => setPurchaseAmount(amt)}
          >
            {amt}
          </div>
        ))}
      </div>
    );
  }
  if (activeTab === 2) {
    return (
      <span className="marketreset">
        Market Reset in {formatTime(timeRemaining)}
      </span>
    );
  }
  if (activeTab === 3) {
    return (
      <div className="switch-tab">
        <div
          className={
            ieSelected === 1 ? "ie-tab ie-selected divider" : "ie-tab divider"
          }
          onClick={() => setIeSelected(1)}
        >
          <span>Ingredients</span>
        </div>
        <div
          className={ieSelected === 2 ? "ie-tab ie-selected" : "ie-tab"}
          onClick={() => setIeSelected(2)}
        >
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

function handleBuyItem(
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
    setInventory([...playerInventory, item]);
    setMarketItems(marketItems.filter((i) => i.key !== item.key));
  }
}

function App() {
  const [money, setMoney] = useState(0);
  const [productionAmount, setProductionAmount] = useState({
    amount: 0,
    multiplier: 1,
  });
  const [activeTab, setActiveTab] = useState(1);
  const [purchaseAmount, setPurchaseAmount] = useState(1);

  const [unlockAmount, setUnlockAmount] = useState({
    chef: 0,
    bakery: 0,
    market: 0,
    factory: 0,
    industry: 0,
  });

  const [unlockPrices, setUnlockprices] = useState({
    chef: 100,
    bakery: 500,
    market: 1000,
    factory: 5000,
    industry: 10000,
  });
  const [croissantStatsTable, setCroissantStatsTable] = useState({
    chef: { cps: 1 },
    bakery: { cps: 6 },
    market: { cps: 15 },
    factory: { cps: 125 },
    industry: { cps: 450 },
  });

  const [marketItems, setMarketItems] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [scSelected, setScSelected] = useState(0);
  const [croissantAmount, setCroissantAmount] = useState(0);
  const [ieSelected, setIeSelected] = useState(1);
  const productionAmountRef = useRef(productionAmount);
  const [croissantStats, setCroissantStats] = useState({
    productionSpeed: 1,
    sellSpeed: 5,
    price: 1,
    sellAmount: 50,
  });
  const croissantStatsRef = useRef(croissantStats);
  const [sellBarKey, setSellBarKey] = useState(0);
  const [inventory, setInventory] = useState([
    { key: "salt", name: "Kosher Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Kosher Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Kosher Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Kosher Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Kosher Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Kosher Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Kosher Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Kosher Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Kosher Salt", rarity: "basic", img: "salt" },
  ]);
  const [prodBarKey, setProdBarKey] = useState(0);
  useEffect(() => {
    croissantStatsRef.current = croissantStats;
  }, [croissantStats]);
  useEffect(() => {
    const sellInterval = setInterval(() => {
      setSellBarKey((prev) => prev + 1);
      setCroissantAmount((prevCount) => {
        let soldAmount =
          croissantStatsRef.current.sellAmount >= prevCount
            ? prevCount
            : croissantStatsRef.current.sellAmount;
        let profit = soldAmount * croissantStatsRef.current.price;
        setMoney((prevMoney) => prevMoney + profit);
        return prevCount - soldAmount;
      });
    }, croissantStats.sellSpeed * 1000);
    return () => clearInterval(sellInterval);
  }, [croissantStats.sellSpeed]);

  useEffect(() => {
    const resetMarket = () => {
      const entries = Object.entries(ingredients);
      const newItems = shuffleMarket(entries, rarityWeight)
        .slice(0, 4)
        .map(([key, value]) => ({
          key,
          ...value,
          price: calculatePbyR(value.rarity),
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
    productionAmountRef.current = productionAmount;
  }, [productionAmount]);

  useEffect(() => {
    const produceInterval = setInterval(() => {
      console.log(productionAmountRef.current.multiplier);
      setCroissantAmount(
        (prev) =>
          prev +
          Math.round(
            productionAmountRef.current.amount *
              productionAmountRef.current.multiplier
          )
      );
      setProdBarKey((prev) => prev + 1);
    }, croissantStats.productionSpeed * 1000);
    return () => clearInterval(produceInterval);
  }, [croissantStats, productionAmount]);

  const handlePurchase = (
    key,
    price,
    addProduction,
    currentProduction,
    croissantStatsTable
  ) => {
    if (money < price * (purchaseAmount === "Max" ? 1 : purchaseAmount)) return;

    if (purchaseAmount === "Max") {
      const maxBuy = Math.floor(money / price);
      setMoney((m) => m - maxBuy * price);
      setUnlockAmount((prev) => ({
        ...prev,
        [key]: prev[key] + maxBuy,
      }));
      let productionIncrease = maxBuy * croissantStatsTable[key].cps;
      addProduction((prev) => ({
        ...prev,
        amount: prev.amount + productionIncrease,
      }));
    } else {
      setMoney((m) => m - price * purchaseAmount);
      setUnlockAmount((prev) => ({
        ...prev,
        [key]: prev[key] + purchaseAmount,
      }));
      let productionIncrease = purchaseAmount * croissantStatsTable[key].cps;
      addProduction((prev) => ({
        ...prev,
        amount: prev.amount + productionIncrease,
      }));
    }
  };

  const addProduction = (amount) => {
    setProductionAmount(amount);
  };

  return (
    <>
      <div className="container">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="topbar-unlock">
          <TopBar
            activeTab={activeTab}
            purchaseAmount={purchaseAmount}
            setPurchaseAmount={setPurchaseAmount}
            timeRemaining={timeRemaining}
            ieSelected={ieSelected}
            setIeSelected={setIeSelected}
          />
        </div>
        <div className="main-unlock">
          {activeTab === 1 && (
            <UnlockShop
              unlockAmount={unlockAmount}
              unlockPrices={unlockPrices}
              purchaseAmount={purchaseAmount}
              onPurchase={handlePurchase}
              addProduction={addProduction}
              currentProduction={productionAmount}
              money={money}
              croissantStatsTable={croissantStatsTable}
            />
          )}
          {activeTab === 2 && (
            <MarketStore
              items={marketItems}
              playerInventory={inventory}
              setInventory={setInventory}
              changeMoney={setMoney}
              money={money}
              setMarketItems={setMarketItems}
              marketItems={marketItems}
            />
          )}
          {activeTab === 3 && (
            <>
              {ieSelected === 1 && (
                <IngredientsList playerInventory={inventory} />
              )}
              {ieSelected === 2 && (
                <EnhancementsList
                  playerInventory={inventory}
                  setInventory={setInventory}
                  setProductionAmount={setProductionAmount}
                  setCroissantStats={setCroissantStats}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className="container">
        <StatsHeader sc={scSelected} scChange={setScSelected} />
        <div className="main-stats">
          <div className="main-clicker">
            <div
              className="clicker"
              onClick={() => {
                setCroissantAmount(croissantAmount + 1);
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
                Croissants <span>{croissantAmount}</span>
              </div>
              <div>
                Money <span>${money}</span>
              </div>
              <div>
                Production{" "}
                <span>
                  {Math.round(
                    productionAmount.amount * productionAmount.multiplier
                  )}
                  /
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
                    key={sellBarKey}
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
                productionAmount.amount > 0
                  ? "progress-container production"
                  : "disabled"
              }
            >
              <div className="progress-mini">
                <FontAwesomeIcon icon={faHammer} />
                <div className="progress">
                  <div
                    key={prodBarKey}
                    className={
                      productionAmount.amount > 0
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
