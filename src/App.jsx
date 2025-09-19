import React, { useState } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUnlock } from '@fortawesome/free-solid-svg-icons'
var croissantplurals = {
 chef: 'chefs',
 bakery: 'bakeries',
 market: 'markets',
 factory:'factories',
 industry: 'industries'
}


var Purchaseamount = 1;
function App() {
 const [croissantunlocks, setamount]=useState({
   chef: 0,
   bakery:0,
   market:0,
   factory:0,
   industry:0,})
 const [purchaseamt, setPurchaseamt] = useState(1);
const purchasechange = (amt) => {
 Purchaseamount = amt;
 setPurchaseamt(amt);
}
 const purchasecroissant=(unlock)=>{
   console.log(croissantunlocks)
   setamount({
     ...croissantunlocks,
     [unlock]: croissantunlocks[unlock]+purchaseamt
   });
 }


 function Uc(type) {
 if (croissantunlocks[type.unlock]<parseInt(type.required)){
   return(<div className='locked'><span><FontAwesomeIcon icon={faUnlock} />Buy {type.required} more {croissantplurals[type.unlock]} to unlock </span></div>)
 }
}


 return (
   <>
  
    <div className='unlock-container'>
     <div className="topbar-unlock"><span>Purchase</span><div className={purchaseamt===1? 'selected':''} onClick={() => purchasechange(1)}>1</div><div className={purchaseamt===10? 'selected':''} onClick={() => purchasechange(10)}>10</div><div className={purchaseamt===100? 'selected':''} onClick={() => purchasechange(100)}>100</div><div className={purchaseamt==='Max'? 'selected':''} onClick={() => purchasechange('Max')}>Max</div></div>
     <div className='main-unlock'>
       <div className="unlock">
         <div className='info'><div className='left-info'><span className='unlock-name'>Croissant Chef
</span><div className='description'>+10 Croissants/s</div></div>
<div className='amount'>{croissantunlocks.chef}</div></div>
<div className='buyarea'><div className='buy-btn' onClick={()=>purchasecroissant('chef')}>Purchase {purchaseamt}</div><div className='price'>$100</div></div>
       </div>
       <div className="unlock">
         <div className='info'><div className='left-info'><span className='unlock-name'>Croissant Bakery
</span><div className='description'>+10 Croissants/s</div></div>
<div className='amount'>{croissantunlocks.bakery}</div></div>
<div className={croissantunlocks.chef>=5?'buyarea':'disabled'}><div className='buy-btn'  onClick={()=>purchasecroissant('bakery')}>Purchase {purchaseamt}</div><div className='price'>$500</div></div>
<Uc unlock='chef' required='5'/>
       </div>
     </div>
    </div>
   </>
 )
}
export default App;