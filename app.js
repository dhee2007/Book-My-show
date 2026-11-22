const restaurants = [
 {id:1,name:"The Spice Route",cuisine:"Indian",rating:4.6,price:350,type:"Veg",emoji:"🍛",area:"Indiranagar",items:[["Paneer Butter Masala",240],["Veg Biryani",190],["Masala Dosa",100]]},
 {id:2,name:"Pasta Street",cuisine:"Italian",rating:4.4,price:500,type:"Veg",emoji:"🍝",area:"Koramangala",items:[["Penne Alfredo",280],["Margherita Pizza",320],["Garlic Bread",130]]},
 {id:3,name:"Dragon Bowl",cuisine:"Chinese",rating:4.3,price:300,type:"Non-Veg",emoji:"🥡",area:"HSR Layout",items:[["Veg Hakka Noodles",180],["Chicken Fried Rice",240],["Spring Rolls",140]]},
 {id:4,name:"Burger Yard",cuisine:"Fast Food",rating:4.2,price:250,type:"Non-Veg",emoji:"🍔",area:"Jayanagar",items:[["Classic Burger",160],["French Fries",90],["Cold Coffee",110]]},
 {id:5,name:"Green Leaf Cafe",cuisine:"Indian",rating:4.5,price:220,type:"Veg",emoji:"🥗",area:"Malleshwaram",items:[["South Indian Meals",180],["Paneer Wrap",150],["Fresh Lime Soda",70]]},
 {id:6,name:"Tandoori Tales",cuisine:"Indian",rating:4.7,price:450,type:"Non-Veg",emoji:"🍗",area:"Whitefield",items:[["Tandoori Chicken",340],["Butter Naan",50],["Dal Tadka",190]]}
];
let cart = JSON.parse(localStorage.getItem("bms_cart")||"[]");
let historyData = JSON.parse(localStorage.getItem("bms_history")||"[]");
let selectedRestaurant = null, activeKind = "All", currentIdentity = localStorage.getItem("bms_user")||"";

function money(n){return "₹"+Number(n).toFixed(0)}
function save(){localStorage.setItem("bms_cart",JSON.stringify(cart));localStorage.setItem("bms_history",JSON.stringify(historyData));updateCartCount()}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function scrollToSection(id){document.getElementById(id).scrollIntoView({behavior:"smooth"})}
function showPage(page){
 document.getElementById("homePage").classList.toggle("hidden",page!=="home");
 document.getElementById("historyPage").classList.toggle("hidden",page!=="history");
 document.getElementById("managerPage").classList.toggle("hidden",page!=="manager");
 document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.page===page));
 if(page==="history")renderHistory();if(page==="manager")renderManager();
}
function renderRestaurants(){
 const q=(document.getElementById("searchInput").value||"").toLowerCase();
 const cuisine=document.getElementById("cuisineFilter").value;
 const sort=document.getElementById("sortFilter").value;
 let list=restaurants.filter(r=>(!q||(r.name+" "+r.cuisine+" "+r.items.map(i=>i[0]).join(" ")).toLowerCase().includes(q))&&(!cuisine||r.cuisine===cuisine)&&
 (activeKind==="All"||(activeKind==="Offers"&&r.id%2===1)||r.type===activeKind));
 if(sort==="rating")list.sort((a,b)=>b.rating-a.rating);if(sort==="price")list.sort((a,b)=>a.price-b.price);
 document.getElementById("restaurantGrid").innerHTML=list.map(r=>`<article class="restaurant-card" onclick="openRestaurant(${r.id})"><div class="restaurant-art">${r.emoji}</div><div class="restaurant-info"><h3>${r.name}</h3><div class="meta"><span>★ ${r.rating}</span><span>${r.cuisine}</span><span>${money(r.price)} for two</span></div><div class="meta" style="margin-top:8px">📍 ${r.area}</div><span class="tag">${r.type} • Menu available</span></div></article>`).join("")||"<p>No restaurants match your search.</p>";
}
function openRestaurant(id){
 selectedRestaurant=restaurants.find(r=>r.id===id);
 document.getElementById("restaurantDetails").innerHTML=`<p class="eyebrow">${selectedRestaurant.cuisine.toUpperCase()} • ${selectedRestaurant.area.toUpperCase()}</p><h2>${selectedRestaurant.emoji} ${selectedRestaurant.name}</h2><p class="muted">★ ${selectedRestaurant.rating} rating • ${money(selectedRestaurant.price)} for two</p><h3>Menu</h3>${selectedRestaurant.items.map((it,i)=>`<div class="menu-row"><div><h4>${it[0]}</h4><p>${money(it[1])} • ${selectedRestaurant.type}</p></div><button class="primary-btn" onclick="addToCart(${id},${i})">Add</button></div>`).join("")}<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="outline-btn" onclick="openReservation(${id})">Reserve Dine-In</button><button class="primary-btn" onclick="toggleCart(true)">View cart</button></div>`;
 document.getElementById("restaurantModal").classList.remove("hidden");
}
function closeModal(){document.getElementById("restaurantModal").classList.add("hidden")}
function addToCart(rid,index){const r=restaurants.find(x=>x.id===rid),it=r.items[index];const existing=cart.find(x=>x.rid===rid&&x.name===it[0]);if(existing)existing.qty++;else cart.push({rid,name:it[0],price:it[1],qty:1,restaurant:r.name});save();renderCart();toast("Added to cart")}
function updateCartCount(){document.getElementById("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0)}
function toggleCart(open){if(open)renderCart();document.getElementById("cartDrawer").classList.toggle("hidden",!open)}
function renderCart(){
 const box=document.getElementById("cartItems");
 box.innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-row"><div><b>${x.name}</b><div class="muted">${x.restaurant} • ${money(x.price)}</div></div><div class="qty"><button onclick="changeQty(${i},-1)">−</button> ${x.qty} <button onclick="changeQty(${i},1)">+</button></div></div>`).join(""):"<p class='muted'>Your cart is empty. Add items from a restaurant menu.</p>";
 const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
 document.getElementById("cartSummary").innerHTML=cart.length?`<div class="checkout-total"><span>Subtotal</span><span>${money(total)}</span></div><button class="primary-btn full" onclick="openCheckout()">Proceed to checkout</button>`:"";
 updateCartCount();
}
function changeQty(i,delta){cart[i].qty+=delta;if(cart[i].qty<=0)cart.splice(i,1);save();renderCart()}
function openCheckout(){if(!cart.length)return;document.getElementById("checkoutModal").classList.remove("hidden");document.getElementById("checkoutTotal").textContent="Subtotal: "+money(cart.reduce((s,x)=>s+x.price*x.qty,0));toggleCart(false)}
function closeCheckout(){document.getElementById("checkoutModal").classList.add("hidden")}
function serviceChanged(){document.getElementById("addressWrap").classList.toggle("hidden",document.getElementById("serviceType").value!=="Delivery")}
function payNow(){
 if(!currentIdentity){closeCheckout();openLogin();toast("Please login to continue");return}
 const service=document.getElementById("serviceType").value;
 if(service==="Delivery"&&!document.getElementById("deliveryAddress").value.trim()){toast("Please enter delivery address");return}
 const subtotal=cart.reduce((s,x)=>s+x.price*x.qty,0),code=document.getElementById("offerCode").value.trim().toUpperCase();
 const discount=code==="FOOD10"?subtotal*.10:code==="WELCOME5"?subtotal*.05:0;
 const order={id:"ORD"+Date.now().toString().slice(-6),type:service,items:[...cart],amount:subtotal-discount,status:"Confirmed",date:new Date().toLocaleString(),address:service==="Delivery"?document.getElementById("deliveryAddress").value:""};
 historyData.unshift(order);cart=[];save();closeCheckout();renderHistory();toast("Demo payment successful. Order confirmed!");showPage("history");
}
function openReservation(id){selectedRestaurant=restaurants.find(r=>r.id===id);closeModal();document.getElementById("reservationModal").classList.remove("hidden");document.getElementById("bookingDate").min=new Date().toISOString().split("T")[0];}
function closeReservation(){document.getElementById("reservationModal").classList.add("hidden")}
function confirmReservation(){
 if(!currentIdentity){closeReservation();openLogin();toast("Please login to reserve");return}
 const date=document.getElementById("bookingDate").value,time=document.getElementById("bookingTime").value,guests=document.getElementById("guests").value;
 if(!date||!time||Number(guests)<1){toast("Please complete booking details");return}
 historyData.unshift({id:"RES"+Date.now().toString().slice(-6),type:"Dine-In Reservation",restaurant:selectedRestaurant.name,date:`${date} ${time}`,guests,amount:0,status:"Confirmed"});
 save();closeReservation();showPage("history");toast("Table reservation confirmed (demo)");
}
function renderHistory(){
 const el=document.getElementById("historyList");
 el.innerHTML=historyData.length?historyData.map(x=>`<div class="history-card"><div><h3>${x.type==="Dine-In Reservation"?"🍽️ "+x.restaurant:"🧾 "+x.id}</h3><p class="muted">${x.type==="Dine-In Reservation"?x.date+" • "+x.guests+" guest(s)":x.type+" • "+x.date}</p><span class="status">${x.status}</span></div><b>${x.amount?money(x.amount):"Reservation"}</b></div>`).join(""):"<div class='history-card'><p class='muted'>No orders or reservations yet. Explore restaurants to get started.</p></div>";
}
function renderManager(){
 const el=document.getElementById("managerActivity");
 el.innerHTML=historyData.length?historyData.slice(0,8).map(x=>`<div class="history-card"><div><b>${x.id||x.restaurant}</b><p class="muted">${x.type} • ${x.date}</p></div><span class="status">${x.status}</span></div>`).join(""):"<p class='muted'>No customer orders or reservations have been placed yet.</p>";
}
function openLogin(){document.getElementById("loginModal").classList.remove("hidden")}
function closeLogin(){document.getElementById("loginModal").classList.add("hidden")}
function sendOtp(){const v=document.getElementById("loginIdentity").value.trim();if(!v){toast("Enter mobile number or email");return}document.getElementById("otpArea").classList.remove("hidden");document.getElementById("loginMessage").textContent="Demo OTP sent. Use 1234."}
function verifyOtp(){if(document.getElementById("otpInput").value!=="1234"){toast("Incorrect OTP. Try 1234.");return}currentIdentity=document.getElementById("loginIdentity").value.trim();localStorage.setItem("bms_user",currentIdentity);document.getElementById("loginBtn").textContent="Hi, "+currentIdentity;closeLogin();toast("Login successful")}
document.getElementById("loginBtn").addEventListener("click",openLogin);
document.getElementById("searchInput").addEventListener("input",renderRestaurants);
document.getElementById("cuisineFilter").addEventListener("change",renderRestaurants);
document.getElementById("sortFilter").addEventListener("change",renderRestaurants);
document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");activeKind=c.dataset.kind;renderRestaurants()}));
if(currentIdentity)document.getElementById("loginBtn").textContent="Hi, "+currentIdentity;
renderRestaurants();renderCart();
