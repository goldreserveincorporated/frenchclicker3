import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUnlock,
  faIndustry,
  faStore,
  faCircleUp,
  faUpLong,
  faRotateRight,
  faFlask,
  faCircle,
  faStar,
  faCaretRight,
  faDiamond,
  faChevronDown,
  faTruck,
  faCaretUp,
  faHammer,
  faClock,
  faWandMagicSparkles,
  faLightbulb,
  faMagnifyingGlass,
  faArrowRight,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function romanize(num) {
  var lookup = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    },
    roman = "",
    i;
  for (i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
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
function getCurrentStat(croissantStats, type) {
  if (type == "selling") {
    return `${croissantStats.sellAmount}/${croissantStats.sellSpeed}s `;
  }
  if (type == "price") {
    return `$${croissantStats.price} `;
  }
  if (type == "discount") {
    return `${croissantStats.discount}% discount`;
  }
  if (type == "luck") {
    return `${croissantStats.luck}x luck`;
  }
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
function levelClass(level) {
  if (level == 20) {
    return "l100";
  }
  if (level >= 15) {
    return "l50";
  }
  if (level >= 10) {
    return "l25";
  }
  if (level >= 5) {
    return "l10";
  } else {
    return "l1";
  }
}
function upgradeClass(level) {
  if (level == 5) {
    return "i5";
  }
  if (level == 4) {
    return "i4";
  }
  if (level == 3) {
    return "i3";
  }
  if (level == 2) {
    return "i2";
  } else {
    return "i1";
  }
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
  salt: { name: "Grey Salt", rarity: "basic", img: "salt" },
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
const croissantUpgrades = {
  selling: {
    name: "Better Delivery",
    type: "selling",
    effect: {
      l1: { display: "150/5s", value: {} },
      l2: { display: "250/5s", value: {} },
      l3: { display: "500/3s", value: {} },
      l4: { display: "1000/2s", value: {} },
      l5: { display: "5000/1s", value: {} },
    },
    cost: {
      l1: { money: 4535342, research: 50 },
      l2: { money: 100, research: 75 },
      l3: { money: 100, research: 150 },
      l4: { money: 100, research: 250 },
      l5: { money: 100, research: 500 },
    },
  },
  price: {
    name: "Higher Quality Croissants",
    type: "price",
    effect: {
      l1: { display: "$2", value: {} },
      l2: { display: "$3", value: {} },
      l3: { display: "$5", value: {} },
      l4: { display: "$8", value: {} },
      l5: { display: "$14", value: {} },
    },
    cost: {
      l1: { money: 100, research: 50 },
      l2: { money: 100, research: 75 },
      l3: { money: 100, research: 150 },
      l4: { money: 100, research: 250 },
      l5: { money: 100, research: 500 },
    },
  },
  cheap: {
    name: "Cheaper Ingredients",
    type: "discount",
    effect: {
      l1: { display: "10% discount", value: {} },
      l2: { display: "20% discount", value: {} },
      l3: { display: "30% discount", value: {} },
      l4: { display: "40% discount", value: {} },
      l5: { display: "50% discount", value: {} },
    },
    cost: {
      l1: { money: 100, research: 50 },
      l2: { money: 100, research: 75 },
      l3: { money: 100, research: 150 },
      l4: { money: 100, research: 250 },
      l5: { money: 100, research: 500 },
    },
  },
  luck: {
    name: "Luckier Market",
    type: "luck",
    effect: {
      l1: { display: "1.2x luck", value: {} },
      l2: { display: "1.4x luck", value: {} },
      l3: { display: "1.6x luck", value: {} },
      l4: { display: "1.8x luck", value: {} },
      l5: { display: "2x luck", value: {} },
    },
    cost: {
      l1: { money: 100, research: 50 },
      l2: { money: 100, research: 75 },
      l3: { money: 100, research: 150 },
      l4: { money: 100, research: 250 },
      l5: { money: 100, research: 500 },
    },
  },
};
const rarityWeight = {
  basic: 25,
  premium: 12,
  deluxe: 10,
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
  currentProduction,
  money,
  croissantStatsTable,
  unlockLevel,
  changeLevel,
  setUnlockLevel,
  changeLevelPrice,
  unlockLevelPrice,
  unlockLevelR,
  setUnlockLevelR,
  research,
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
              <div className="un-container">
                <div className="unlock-name">
                  <div
                    className={`c-level ${levelClass(unlockLevel[key])}`}
                    data-splitting
                  >
                    {unlockLevel[key] == 20 ? "MAX" : `L${unlockLevel[key]}`}
                  </div>
                  Croissant {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
              </div>
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
          <div
            className={`train-area ${
              unlockAmount[key] >= unlockLevelR[key] && unlockLevel[key] < 20
                ? ""
                : "disabled"
            }`}
          >
            <div
              className={`train-btn ${levelClass(unlockLevel[key])} ${
                research >= unlockLevelPrice[key] ? "" : "btn-disabled"
              }`}
              onClick={() =>
                changeLevel(
                  key,
                  unlockLevelPrice[key],
                  setUnlockLevel,
                  changeLevelPrice,
                  setUnlockLevelR,
                  research
                )
              }
            >
              Upgrade to L{unlockLevel[key] + 1}
            </div>
            <div className="train-cost">
              <span>
                {unlockLevelPrice[key]}
                <i>R</i> required
              </span>
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
              <div className="un-container">
                <div className="unlock-name">
                  Croissant {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
              </div>
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

function UpgradeShop({
  croissantUpgrades,
  croissantStats,
  research,
  changeCroissantULevel,
  croissantULevel,
  changeMoney,
}) {
  const entries = Object.entries(croissantUpgrades);
  return entries.map(([key, value]) => (
    <div className="upgrade" key={key}>
      <div className="info">
        <div className="left-info">
          <div className="un-container">
            <div className="unlock-name">
              <div className={`u-level ${upgradeClass(croissantULevel[key])}`}>
                {romanize(croissantULevel[key])}
              </div>
              {value.name}
            </div>
          </div>
          <div className="description">
            {getCurrentStat(croissantStats, value.type)}
            <FontAwesomeIcon icon={faCaretRight} />{" "}
            {value.effect[`l${croissantULevel[key]}`].display}
          </div>
        </div>
      </div>
      <div
        className={
          research >= value.cost[`l${croissantULevel[key]}`].research
            ? "buyarea"
            : "buyarea disabled"
        }
      >
        <div
          className="buy-btn"
          onClick={() =>
            changeCroissantULevel(
              key,
              value.cost[`l${croissantULevel[key]}`].money,
              changeMoney
            )
          }
        >
          Upgrade
        </div>
        <div className="price">
          ${value.cost[`l${croissantULevel[key]}`].money}
        </div>
      </div>
      <div
        className={
          research >= value.cost[`l${croissantULevel[key]}`].research
            ? "research-req disabled"
            : "research-req"
        }
      >
        <div>
          <span>
            <FontAwesomeIcon icon={faUpLong} />
            {value.cost[`l${croissantULevel[key]}`].research}
            <i>R </i> required to upgrade
          </span>
        </div>
      </div>
    </div>
  ));
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
  setProductionMultiplier
) {
  if (enhancement.key == "expensive") {
    setCroissantStats((prev) => ({
      ...prev,
      price: prev.price + enhancement.effect.effect,
    }));
    setTimeout(() => {
      setCroissantStats((prev) => ({
        ...prev,
        price: prev.price - enhancement.effect.effect,
      }));
    }, enhancement.effect.duration * 1000);
  }
  if (enhancement.key == "sell") {
    setCroissantStats((prev) => ({
      ...prev,
      sellAmount: Math.round(prev.sellAmount * enhancement.effect.effect),
    }));
    setTimeout(() => {
      setCroissantStats((prev) => ({
        ...prev,
        sellAmount: Math.round(prev.sellAmount / enhancement.effect.effect),
      }));
    }, enhancement.effect.duration * 1000);
  }
  if (enhancement.key == "produce") {
    setProductionMultiplier(enhancement.effect.effect);
    setTimeout(() => {
      setProductionMultiplier(1 / enhancement.effect.effect);
    }, enhancement.effect.duration * 1000);
  }
}
function craftEnhancement(
  inventory,
  enhancement,
  setInventory,
  setCroissantStats,
  setProductionMultiplier
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
  activateEnhancement(enhancement, setCroissantStats, setProductionMultiplier);
}
function EnhancementsList({
  playerInventory,
  setInventory,
  setCroissantStats,
  setProductionMultiplier,
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
            setProductionMultiplier
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
        <FontAwesomeIcon icon={faWandMagicSparkles} />
        Enhance
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
  const [money, setMoney] = useState(543254443);
  const [productionMultiplier, setProductionMultiplier] = useState(1);
  const [unlockLevel, setUnlockLevel] = useState({
    chef: 1,
    bakery: 1,
    market: 1,
    factory: 1,
    industry: 1,
  });
  const [croissantULevel, setCroissantULevel] = useState({
    selling: 1,
    price: 1,
    cheap: 1,
    luck: 1,
  });
  const [unlockLevelR, setUnlockLevelR] = useState({
    chef: 5,
    bakery: 5,
    market: 5,
    factory: 5,
    industry: 5,
  });
  const [unlockLevelPrice, setUnlockLevelPrice] = useState({
    chef: 10,
    bakery: 10,
    market: 10,
    factory: 10,
    industry: 10,
  });
  const [croissantMultiplier, setCroissantMultiplier] = useState({
    chef: 1,
    bakery: 1,
    market: 1,
    factory: 1,
    industry: 1,
  });
  const [activeTab, setActiveTab] = useState(1);
  const [activeUTab, setActiveUTab] = useState(1);
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
  function getProduction(
    productionMultiplier,
    croissantMultiplier,
    unlockAmount
  ) {
    let production = 0;
    for (const key in croissantMultiplier) {
      production +=
        unlockAmount[key] *
        croissantStatsTable[key].cps *
        croissantMultiplier[key];
    }
    return production * productionMultiplier;
  }
  const changeProductionMultiplier = (value) => {
    console.log("Changing production multiplier by", value);
    setProductionMultiplier((prev) => prev * value);
  };
  const [marketItems, setMarketItems] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [scSelected, setScSelected] = useState(0);
  const [croissantAmount, setCroissantAmount] = useState(0);
  const [ieSelected, setIeSelected] = useState(1);
  const [croissantStats, setCroissantStats] = useState({
    productionSpeed: 1,
    sellSpeed: 5,
    price: 1,
    luck: 1,
    discount: 0,
    sellAmount: 100,
  });
  const [research, setResearch] = useState(432433);

  const croissantStatsRef = useRef(croissantStats);
  const [sellBarKey, setSellBarKey] = useState(0);
  const [inventory, setInventory] = useState([
    { key: "salt", name: "Grey Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Grey Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Grey Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Grey Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Grey Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Grey Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Grey Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Grey Salt", rarity: "basic", img: "salt" },
    { key: "salt", name: "Grey Salt", rarity: "basic", img: "salt" },
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
    const produceInterval = setInterval(() => {
      var production = 0;
      for (const key in croissantMultiplier) {
        production +=
          unlockAmount[key] *
          croissantStatsTable[key].cps *
          croissantMultiplier[key];
      }
      setCroissantAmount(
        (prev) => prev + Math.round(production * productionMultiplier)
      );
      setProdBarKey((prev) => prev + 1);
    }, croissantStats.productionSpeed * 1000);
    return () => clearInterval(produceInterval);
  }, [
    croissantStats,
    croissantMultiplier,
    productionMultiplier,
    unlockAmount,
    croissantStatsTable,
  ]);
  const changeLevel = (
    key,
    price,
    setLevel,
    changeLevelPrice,
    setUnlockLevelR,
    research
  ) => {
    if (research >= price) {
      setLevel((prev) => ({
        ...prev,
        [key]: prev[key] + 1,
      }));
      changeLevelPrice(key);
      changeUnlockLevelR(key);
    }
  };
  const changeCroissantULevel = (key, money, setMoney) => {
    setCroissantULevel((prev) => ({
      ...prev,
      [key]: prev[key] + 1,
    }));
    setMoney((prevMoney) => prevMoney - money);
  };
  const changeUnlockLevelR = (key) => {
    setUnlockLevelR((prev) => ({
      ...prev,
      [key]: Math.floor(prev[key] * 1.3),
    }));
  };
  const changeLevelPrice = (key) => {
    setUnlockLevelPrice((prev) => ({
      ...prev,
      [key]: Math.ceil(prev[key] * 1.5),
    }));
  };
  const handlePurchase = (key, price, croissantStatsTable) => {
    if (money < price * (purchaseAmount === "Max" ? 1 : purchaseAmount)) return;

    if (purchaseAmount === "Max") {
      const maxBuy = Math.floor(money / price);
      setMoney((m) => m - maxBuy * price);
      setUnlockAmount((prev) => ({
        ...prev,
        [key]: prev[key] + maxBuy,
      }));
    } else {
      setMoney((m) => m - price * purchaseAmount);
      setUnlockAmount((prev) => ({
        ...prev,
        [key]: prev[key] + purchaseAmount,
      }));
    }
  };

  return (
    <>
      <div className="container uncontainer">
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
              money={money}
              croissantStatsTable={croissantStatsTable}
              unlockLevel={unlockLevel}
              changeLevel={changeLevel}
              setUnlockLevel={setUnlockLevel}
              changeLevelPrice={changeLevelPrice}
              unlockLevelPrice={unlockLevelPrice}
              unlockLevelR={unlockLevelR}
              setUnlockLevelR={changeUnlockLevelR}
              research={research}
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
                  setCroissantStats={setCroissantStats}
                  setProductionMultiplier={changeProductionMultiplier}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className="container scontainer">
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
                Production
                <span>
                  {Math.round(
                    getProduction(
                      productionMultiplier,
                      croissantMultiplier,
                      unlockAmount
                    )
                  )}
                  /
                  {croissantStats.productionSpeed === 1
                    ? ""
                    : croissantStats.productionSpeed}
                  s
                </span>
              </div>
              <div>
                Sell Rate
                <span>
                  {croissantStats.sellAmount}/{croissantStats.sellSpeed}s
                </span>
              </div>
              <div>
                Sell Price <span>${croissantStats.price}</span>
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
                getProduction(
                  productionMultiplier,
                  croissantMultiplier,
                  unlockAmount
                ) > 0
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
                      getProduction(
                        productionMultiplier,
                        croissantMultiplier,
                        unlockAmount
                      ) > 0
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
      <div className="upcontainer container">
        <div className="upgrades-header">
          <div
            className={
              activeUTab === 1 ? "upgrade-type uiselected" : "upgrade-type"
            }
            onClick={() => setActiveUTab(1)}
          >
            <FontAwesomeIcon icon={faCircleUp} /> Upgrades
          </div>
          <div
            className={
              activeUTab === 2 ? "upgrade-type uiselected" : "upgrade-type"
            }
            onClick={() => setActiveUTab(2)}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Research
          </div>
          <div className="upgrade-type storage">
            <FontAwesomeIcon icon={faBox} /> Storage
          </div>
        </div>
        <div className="main-upgrades">
          {activeUTab === 1 && (
            <UpgradeShop
              croissantUpgrades={croissantUpgrades}
              croissantStats={croissantStats}
              research={research}
              croissantULevel={croissantULevel}
              changeCroissantULevel={changeCroissantULevel}
              changeMoney={setMoney}
            />
          )}
          {activeUTab === 3 && <></>}
        </div>
      </div>
    </>
  );
}

export default App;
