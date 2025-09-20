import React, { useEffect, useState } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUnlock } from '@fortawesome/free-solid-svg-icons'
import { faIndustry } from '@fortawesome/free-solid-svg-icons'
import { faStore } from '@fortawesome/free-solid-svg-icons'
import { faTruck } from '@fortawesome/free-solid-svg-icons'
var croissantplurals = {
 chef: 'Chefs',
 bakery: 'Bakeries',
 market: 'Markets',
 factory:'Factories',
 industry: 'Industries'
}
var croissantunlockdata = {
chef: {price: 100, required: 0},
bakery: {price: 500,required: 5},
market: {price: 1000,  required: 10},
factory: {price: 5000,  required: 25},
industry: {price: 10000, required: 50},
}


var Purchaseamount = 1;
function App() {
  const [croissantunlockprices, pricechange] =  useState({
  chef: 100,
  bakery: 500,
  market:1000,
  factory:5000,
  industry:10000,
})
const [croissantunlockstats, setstats]=useState({
  chef: {cps: 1},
  bakery: {cps: 5},
  market: {cps: 10},
  factory: {cps: 50},
  industry: {cps: 100},
})
 const [croissantunlocks, setamount]=useState({
   chef: 0,
   bakery:0,
   market:0,
   factory:0,
   industry:0,})
const [money, setmoney]=useState(43214323);
const [purchaseamt, setPurchaseamt] = useState(1);
const purchasechange = (amt) => {
 Purchaseamount = amt;
 setPurchaseamt(amt);
}
const [unlockui, changeui] = useState(1);
const unlockuichange = (unlockuitype) => {
 changeui(unlockuitype);
}
const unlockpricechange = (unlock, change) => {
 pricechange({
   ...croissantunlockprices,
   [unlock]: croissantunlockprices[unlock] * change
 });
}

const changemoney = (amt) => {
 setmoney(money + amt);
}
 const purchasecroissant=(unlock, price)=>{
  console.log(unlock);
  console.log(price);
  if (money<price*purchaseamt) return;
  if (purchaseamt==='Max'){
    var maxbuy = Math.floor(money/price);
    changemoney(-maxbuy*price);
    setamount({
      ...croissantunlocks,
      [unlock]: croissantunlocks[unlock]+maxbuy
    });
    return;
   }
  changemoney(-price*purchaseamt);
   setamount({
     ...croissantunlocks,
     [unlock]: croissantunlocks[unlock]+purchaseamt
   });
 }

function Croissantunlockshop() {
  const entries = Object.entries(croissantunlockdata);


  let firstLockedIndex = entries.findIndex(([key, value], index) => {
    if (index === 0) return false; // first one (chef) is always unlocked
    const [prevKey] = entries[index - 1];
    return croissantunlocks[prevKey] < value.required;
  });


  if (firstLockedIndex === -1) firstLockedIndex = entries.length;

  return entries.map(([key, value], index) => {
    if (index < firstLockedIndex) {
      return (
        <div className="unlock" key={key}>
          <div className="info">
            <div className="left-info">
              <span className="unlock-name">
                Croissant {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <div className="description">
                +{croissantunlockstats[key].cps} Croissants/s
              </div>
            </div>
            <div className="amount">{croissantunlocks[key]}</div>
          </div>
          <div className="buyarea">
            <div
              className="buy-btn"
              onClick={() =>
                purchasecroissant(key, croissantunlockprices[key])
              }
            >
              Purchase {purchaseamt}
            </div>
            <div className="price">${croissantunlockprices[key]}</div>
          </div>
        </div>
      );
    } else if (index === firstLockedIndex) {
      const [prevKey] = entries[index - 1];
      
      return (<div className='locked-container'>        <Uc key={key} unlock={prevKey} required={value.required} /><div className="unlock blur" key={key}>

          <div className="info">
            <div className="left-info">
              <span className="unlock-name">
                Croissant {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <div className="description">
                +{croissantunlockstats[key].cps} Croissants/s
              </div>
            </div>
          </div>
          <div className="buyarea">
            <div
              className="buy-btn unusable"
            >
              Purchase {purchaseamt}
            </div>
            <div className="price">${croissantunlockprices[key]}</div>
          </div>
        </div> </div>);
    }
    return null;
  });
}



 function Uc(type) {

 if (croissantunlocks[type.unlock]<parseInt(type.required)){
   return(<div className='locked'><span><FontAwesomeIcon icon={faUnlock} />Buy {parseInt(type.required) - croissantunlocks[type.unlock]} more {croissantplurals[type.unlock]} to unlock </span></div>)
 }
}
function renderunlock(unlockui) {
  if (unlockui===1) return <Croissantunlockshop />;
  if (unlockui===2) return <div className='notready'><span>ibgoon</span></div>;
  if (unlockui===3) return <div className='notready'><span>deliverygoon</span></div>;
}


 return (
   <>

    <div className='unlock-container'>
      <div className='unlock-header'>
        <div className={unlockui===1?'unlock-type uiselected':'unlock-type'} onClick={() => unlockuichange(1)}><FontAwesomeIcon icon={faIndustry} /> Production</div>
      <div className={unlockui===2?'unlock-type uiselected':'unlock-type'} onClick={() => unlockuichange(2)}><FontAwesomeIcon icon={faStore} /> Store</div>
      <div className={unlockui===3?'unlock-type uiselected':'unlock-type'} onClick={() => unlockuichange(3)}><FontAwesomeIcon icon={faTruck} />Delivery</div>
      </div>
     <div className="topbar-unlock"><div className='pa-container'><span>Purchase</span><div className={purchaseamt===1? 'selected pa-change':'pa-change'} onClick={() => purchasechange(1)}>1</div><div className={purchaseamt===10? 'selected pa-change':'pa-change'} onClick={() => purchasechange(10)}>10</div><div className={purchaseamt===100? 'selected pa-change':'pa-change'} onClick={() => purchasechange(100)}>100</div><div className={purchaseamt==='Max'? 'selected pa-change':'pa-change'} onClick={() => purchasechange('Max')}>Max</div>
     </div><div className='selection-container'></div>

     </div>
     <div className='main-unlock'>
{renderunlock(unlockui)}

     </div>
    </div>
   </>
 )
}
export default App;