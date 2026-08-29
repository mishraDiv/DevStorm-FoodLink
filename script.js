/* =========================================================
   APPLICATION STATE
========================================================= */

const STORAGE_KEYS = {

    USERS:"foodlink_users",
    DONATIONS:"foodlink_donations",
    CLAIMS:"foodlink_claims",
    SESSION:"foodlink_session"

};


let currentUser = null;

let selectedFoodId = null;

let donations = [];

let claims = [];


/* =========================================================
   STORAGE
========================================================= */

function loadData(){

    seedDemoUsers();

    donations =
        JSON.parse(
            localStorage.getItem(
                STORAGE_KEYS.DONATIONS
            )
        ) || createDemoDonations();


    claims =
        JSON.parse(
            localStorage.getItem(
                STORAGE_KEYS.CLAIMS
            )
        ) || [];


    saveDonations();
    saveClaims();

}


function seedDemoUsers(){

    const existingUsers = getUsers();

    const demoUsers = [
        {
            name:"Demo Donor",
            email:"demo@donor.com",
            password:"123456",
            role:"donor",
            verified:true,
            createdAt:new Date().toISOString()
        },
        {
            name:"Demo Organization",
            email:"demo@ngo.com",
            password:"123456",
            role:"ngo",
            verified:true,
            createdAt:new Date().toISOString()
        }
    ];

    const seen = new Set(
        existingUsers.map(user => `${user.email}:${user.role}`)
    );

    const missing = demoUsers.filter(
        user => !seen.has(`${user.email}:${user.role}`)
    );

    if(missing.length){
        existingUsers.push(...missing);
        saveUsers(existingUsers);
    }

}


function saveDonations(){

    localStorage.setItem(
        STORAGE_KEYS.DONATIONS,
        JSON.stringify(donations)
    );

}


function saveClaims(){

    localStorage.setItem(
        STORAGE_KEYS.CLAIMS,
        JSON.stringify(claims)
    );

}


function getUsers(){

    return JSON.parse(
        localStorage.getItem(
            STORAGE_KEYS.USERS
        )
    ) || [];

}


function saveUsers(users){

    localStorage.setItem(
        STORAGE_KEYS.USERS,
        JSON.stringify(users)
    );

}


/* =========================================================
   DEMO DATA
========================================================= */

function createDemoDonations(){

    const now = Date.now();


    return [

        {
            id:"FL-1001",

            name:"Fresh Vegetable Meals",

            quantity:120,

            type:"Vegetarian",

            storage:"Refrigerated",

            preparedRaw:
                new Date(
                    now - 60*60*1000
                ).toISOString(),

            expiryRaw:
                new Date(
                    now + 2*60*60*1000
                ).toISOString(),

            pickupRaw:
                new Date(
                    now + 90*60*1000
                ).toISOString(),

            location:"LPU Campus",

            notes:"Freshly prepared meals.",

            status:"Available",

            emoji:"🍛",

            owner:"demo@donor.com",

            claimedBy:null

        },


        {
            id:"FL-1002",

            name:"Packed Rice Meals",

            quantity:60,

            type:"Vegetarian",

            storage:"Hot / Heated",

            preparedRaw:
                new Date(
                    now - 45*60*1000
                ).toISOString(),

            expiryRaw:
                new Date(
                    now + 3*60*60*1000
                ).toISOString(),

            pickupRaw:
                new Date(
                    now + 2*60*60*1000
                ).toISOString(),

            location:"Phagwara",

            notes:"Packed individually.",

            status:"Available",

            emoji:"🍱",

            owner:"demo@donor.com",

            claimedBy:null

        },


        {
            id:"FL-1003",

            name:"Bakery Food Packs",

            quantity:35,

            type:"Bakery",

            storage:"Room Temperature",

            preparedRaw:
                new Date(
                    now - 30*60*1000
                ).toISOString(),

            expiryRaw:
                new Date(
                    now + 4*60*60*1000
                ).toISOString(),

            pickupRaw:
                new Date(
                    now + 3*60*60*1000
                ).toISOString(),

            location:"Nearby Community",

            notes:"Packed bakery items.",

            status:"Available",

            emoji:"🍞",

            owner:"demo@donor.com",

            claimedBy:null

        }

    ];

}


/* =========================================================
   AUTH
========================================================= */

function showHome(){

    document
        .getElementById("homePage")
        .classList.remove("hidden");

    document
        .getElementById("authScreen")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.add("hidden");

}


function showAuth(){

    document
        .getElementById("homePage")
        .classList.add("hidden");

    document
        .getElementById("authScreen")
        .classList.remove("hidden");

    document
        .getElementById("app")
        .classList.add("hidden");

    showLogin();

}


function showSignup(){

    document
        .getElementById("loginForm")
        .classList.add("hidden");

    document
        .getElementById("signupForm")
        .classList.remove("hidden");

}


function showLogin(){

    document
        .getElementById("signupForm")
        .classList.add("hidden");

    document
        .getElementById("loginForm")
        .classList.remove("hidden");

}


function signup(event){

    event.preventDefault();


    const name =
        document
        .getElementById("signupName")
        .value
        .trim();

    const email =
        document
        .getElementById("signupEmail")
        .value
        .trim()
        .toLowerCase();

    const password =
        document
        .getElementById("signupPassword")
        .value;

    const role =
        document
        .getElementById("signupRole")
        .value;


    if(password.length < 6){

        showToast(
            "Password must contain at least 6 characters."
        );

        return;

    }


    const users = getUsers();


    if(
        users.some(
            user =>
                user.email === email
        )
    ){

        showToast(
            "An account with this email already exists."
        );

        return;

    }


    const user = {

        name,
        email,
        password,
        role,

        verified:true,

        createdAt:
            new Date().toISOString()

    };


    users.push(user);

    saveUsers(users);


    currentUser = {
        ...user
    };


    localStorage.setItem(
        STORAGE_KEYS.SESSION,
        JSON.stringify(currentUser)
    );


    enterApplication();


    showToast(
        "Account created successfully ✓"
    );

}


function login(event){

    event.preventDefault();


    const email =
        document
        .getElementById("loginEmail")
        .value
        .trim()
        .toLowerCase();

    const password =
        document
        .getElementById("loginPassword")
        .value;

    const role =
        document
        .getElementById("loginRole")
        .value;


    const users = getUsers();


    /*
       Demo login:
       If no registered account exists,
       allow the demo credentials.
    */

    let user =
        users.find(
            item =>
                item.email === email &&
                item.password === password &&
                item.role === role
        );


    if(!user){

        if(
            email === "demo@donor.com" &&
            password === "123456" &&
            role === "donor"
        ){

            user = {

                name:"Demo Donor",
                email,
                role:"donor",
                verified:true

            };

        }


        else if(
            email === "demo@ngo.com" &&
            password === "123456" &&
            role === "ngo"
        ){

            user = {

                name:"Demo Organization",
                email,
                role:"ngo",
                verified:true

            };

        }

    }


    if(!user){

        showToast(
            "Invalid email, password or account type."
        );

        return;

    }


    currentUser = user;


    localStorage.setItem(
        STORAGE_KEYS.SESSION,
        JSON.stringify(currentUser)
    );


    enterApplication();


    showToast(
        "Login successful ✓"
    );

}


function logout(){

    currentUser = null;

    localStorage.removeItem(
        STORAGE_KEYS.SESSION
    );


    document
        .getElementById("app")
        .classList.add("hidden");


    showHome();

}


/* =========================================================
   ENTER APPLICATION
========================================================= */

function enterApplication(){

    document
        .getElementById("homePage")
        .classList.add("hidden");

    document
        .getElementById("authScreen")
        .classList.add("hidden");

    document
        .getElementById("app")
        .classList.remove("hidden");


    updateUserInterface();

}


/* =========================================================
   USER INTERFACE
========================================================= */

function updateUserInterface(){

    const name =
        (currentUser.name || "User")
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );


    document
        .getElementById("headerName")
        .textContent = name;


    document
        .getElementById("avatar")
        .textContent =
            name.charAt(0).toUpperCase();


    document
        .getElementById("headerRole")
        .textContent =
            currentUser.role === "donor"
            ? "Food Donor"
            : "Verified Organization";


    document
        .getElementById("donorDashboard")
        .classList.toggle(
            "hidden",
            currentUser.role !== "donor"
        );


    document
        .getElementById("ngoDashboard")
        .classList.toggle(
            "hidden",
            currentUser.role !== "ngo"
        );


    document
        .getElementById("foodTab")
        .classList.toggle(
            "hidden",
            currentUser.role !== "ngo"
        );


    showPage("dashboard");

}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(page,button=null){

    const pages = [

        "donorDashboard",
        "ngoDashboard",
        "foodPage",
        "trackingPage"

    ];


    pages.forEach(id => {

        const element =
            document.getElementById(id);

        if(element){

            element.classList.add("hidden");

        }

    });


    if(page === "dashboard"){

        const dashboard =
            currentUser.role === "donor"
            ? "donorDashboard"
            : "ngoDashboard";


        document
            .getElementById(dashboard)
            .classList.remove("hidden");

    }


    if(page === "food"){

        if(currentUser.role !== "donor"){

            return;

        }


        document
            .getElementById("foodPage")
            .classList.remove("hidden");

    }


    if(page === "tracking"){

        document
            .getElementById("trackingPage")
            .classList.remove("hidden");

    }


    document
        .querySelectorAll(".nav-tab")
        .forEach(tab =>
            tab.classList.remove("active")
        );


    const target =
        button ||
        document.querySelector(
            `.nav-tab[data-page="${page}"]`
        );


    if(target){

        target.classList.add("active");

    }


    renderAll();

}


/* =========================================================
   DONATION FORM
========================================================= */

function openDonationForm(){

    showPage("food");

}


/* =========================================================
   CREATE DONATION
========================================================= */

function createDonation(event){

    event.preventDefault();


    if(
        !currentUser ||
        currentUser.role !== "donor"
    ){

        showToast(
            "Only donors can create donations."
        );

        return;

    }


    const name =
        document
        .getElementById("foodName")
        .value
        .trim();

    const quantity =
        Number(
            document
            .getElementById("foodQuantity")
            .value
        );

    const type =
        document
        .getElementById("foodType")
        .value;

    const storage =
        document
        .getElementById("storage")
        .value;

    const prepared =
        document
        .getElementById("preparedTime")
        .value;

    const expiry =
        document
        .getElementById("expiryTime")
        .value;

    const pickup =
        document
        .getElementById("pickupDeadline")
        .value;

    const location =
        document
        .getElementById("pickupLocation")
        .value
        .trim();

    const notes =
        document
        .getElementById("foodNotes")
        .value
        .trim();


    const now = new Date();

    const preparedDate =
        new Date(prepared);

    const expiryDate =
        new Date(expiry);

    const pickupDate =
        new Date(pickup);


    if(
        !name ||
        !quantity ||
        !type ||
        !storage ||
        !prepared ||
        !expiry ||
        !pickup ||
        !location
    ){

        showToast(
            "Please complete all required fields."
        );

        return;

    }


    if(
        Number.isNaN(
            preparedDate.getTime()
        ) ||
        Number.isNaN(
            expiryDate.getTime()
        ) ||
        Number.isNaN(
            pickupDate.getTime()
        )
    ){

        showToast(
            "Please enter valid date and time."
        );

        return;

    }


    if(preparedDate > now){

        showToast(
            "Preparation time cannot be in the future."
        );

        return;

    }


    if(expiryDate <= now){

        showToast(
            "Cannot list already expired food."
        );

        return;

    }


    if(pickupDate <= now){

        showToast(
            "Pickup deadline must be in the future."
        );

        return;

    }


    if(pickupDate > expiryDate){

        showToast(
            "Pickup deadline must be before food expiry."
        );

        return;

    }


    const donation = {

        id:
            "FL-" +
            Math.floor(
                1000 +
                Math.random() * 9000
            ),

        name,

        quantity,

        type,

        storage,

        preparedRaw:
            preparedDate.toISOString(),

        expiryRaw:
            expiryDate.toISOString(),

        pickupRaw:
            pickupDate.toISOString(),

        location,

        notes,

        status:"Available",

        emoji:
            type === "Bakery"
            ? "🍞"
            : type === "Fruits"
            ? "🍎"
            : type === "Packaged Food"
            ? "📦"
            : "🍱",

        owner:
            currentUser.email,

        claimedBy:null,

        createdAt:
            new Date().toISOString()

    };


    donations.unshift(
        donation
    );


    saveDonations();


    document
        .getElementById("donationForm")
        .reset();


    showPage("dashboard");


    showToast(
        "Food donation listed successfully ✓"
    );

}


/* =========================================================
   EXPIRY ENGINE
========================================================= */

function checkExpiredDonations(){

    const now =
        Date.now();

    let changed = false;


    donations.forEach(food => {

        if(
            food.status === "Available" &&
            (
                now >=
                new Date(
                    food.expiryRaw
                ).getTime()

                ||

                now >=
                new Date(
                    food.pickupRaw
                ).getTime()
            )
        ){

            food.status =
                "Expired";

            changed = true;

        }

    });


    if(changed){

        saveDonations();

        renderAll();

        showToast(
            "A donation expired and is no longer claimable."
        );

    }

}


/*
   Silent expiry check used before rendering.
*/

function checkExpirySilently(){

    const now =
        Date.now();

    let changed = false;


    donations.forEach(food => {

        if(
            food.status === "Available" &&
            (
                now >=
                new Date(
                    food.expiryRaw
                ).getTime()

                ||

                now >=
                new Date(
                    food.pickupRaw
                ).getTime()
            )
        ){

            food.status =
                "Expired";

            changed = true;

        }

    });


    if(changed){

        saveDonations();

    }

}


/* =========================================================
   DONOR LIST
========================================================= */

function renderDonations(){

    const container =
        document.getElementById(
            "donorList"
        );


    if(!container) return;


    const myDonations =
        donations.filter(
            food =>
                food.owner ===
                currentUser.email
        );


    const active =
        myDonations.filter(
            food =>
                food.status === "Available"
        ).length;


    const claimed =
        myDonations.filter(
            food =>
                food.status === "Claimed"
        ).length;


    const expired =
        myDonations.filter(
            food =>
                food.status === "Expired"
        ).length;


    document
        .getElementById("donorActive")
        .textContent = active;


    document
        .getElementById("donorClaimed")
        .textContent = claimed;


    document
        .getElementById("donorExpired")
        .textContent = expired;


    if(myDonations.length === 0){

        container.innerHTML =
            emptyState(
                "🍱",
                "No donations yet",
                "Add your first surplus food donation."
            );

        return;

    }


    container.innerHTML = `

        <div class="food-list">

            ${
                myDonations
                .slice(0,8)
                .map(
                    food =>
                        foodCard(
                            food,
                            false
                        )
                )
                .join("")
            }

        </div>

    `;

}


/* =========================================================
   AVAILABLE FOOD
========================================================= */

function renderAvailableFood(){

    const container =
        document.getElementById(
            "availableFood"
        );


    if(!container) return;


    const search =
        (
            document
            .getElementById("foodSearch")
            ?.value || ""
        )
        .trim()
        .toLowerCase();


    const filter =
        document
        .getElementById("foodFilter")
        ?.value || "all";


    const available =
        donations.filter(food => {

            if(
                food.status !==
                "Available"
            ){

                return false;

            }


            if(
                filter !== "all" &&
                food.type !== filter
            ){

                return false;

            }


            if(!search){

                return true;

            }


            return (

                food.name
                    .toLowerCase()
                    .includes(search)

                ||

                food.location
                    .toLowerCase()
                    .includes(search)

            );

        });


    document
        .getElementById("availableCount")
        .textContent =
            donations.filter(
                food =>
                    food.status === "Available"
            ).length;


    if(available.length === 0){

        container.innerHTML =
            emptyState(
                "🍃",
                "No matching food",
                "Available food appears here until its deadline."
            );

        return;

    }


    container.innerHTML = `

        <div class="food-list">

            ${
                available
                .map(
                    food =>
                        foodCard(
                            food,
                            true
                        )
                )
                .join("")
            }

        </div>

    `;

}


/* =========================================================
   FOOD CARD
========================================================= */

function foodCard(
    food,
    claimable
){

    const expired =
        food.status === "Expired";

    const claimed =
        food.status === "Claimed";


    const statusClass =
        expired
        ? "danger"
        : claimed
        ? "pending"
        : "safe";


    const statusText =
        expired
        ? "EXPIRED"
        : claimed
        ? "CLAIMED"
        : "AVAILABLE";


    let deadline = "";


    if(
        food.status ===
        "Available"
    ){

        const remaining =
            getRemainingTime(
                food.pickupRaw
            );


        deadline =
            remaining.expired

            ?

            `
                <div class="expired-message">
                    🔴 Deadline passed — no longer claimable
                </div>
            `

            :

            `
                <div class="deadline-box">
                    ⏱ ${remaining.text}
                </div>
            `;

    }


    return `

        <div class="food-item">


            <div class="food-icon">
                ${food.emoji}
            </div>


            <div>

                <div class="food-name">
                    ${escapeHTML(food.name)}
                </div>


                <div class="food-meta">

                    <span class="meta">
                        ${food.quantity} meals
                    </span>

                    <span class="meta">
                        ${escapeHTML(food.type)}
                    </span>

                    <span class="meta">
                        ${escapeHTML(food.storage)}
                    </span>

                    <span class="meta">
                        📍 ${escapeHTML(food.location)}
                    </span>

                </div>


                <div class="food-meta">

                    <span
                        class="status ${statusClass}">

                        ${statusText}

                    </span>

                    <span class="meta">
                        Expires
                        ${formatDate(food.expiryRaw)}
                    </span>

                </div>


                ${deadline}

            </div>


            <div>

                ${
                    claimable &&
                    food.status === "Available"

                    ?

                    `
                        <button
                            class="claim-btn"
                            onclick="openClaimModal('${food.id}')">

                            Claim

                        </button>
                    `

                    :

                    ""
                }

            </div>

        </div>

    `;

}


/* =========================================================
   CLAIM MODAL
========================================================= */

function openClaimModal(id){

    checkExpirySilently();


    const food =
        donations.find(
            item =>
                item.id === id
        );


    if(!food){

        showToast(
            "Food donation not found."
        );

        return;

    }


    if(
        food.status !==
        "Available"
    ){

        showToast(
            "This food is no longer available."
        );

        renderAll();

        return;

    }


    selectedFoodId =
        food.id;


    document
        .getElementById("claimDetails")
        .innerHTML = `

            <div class="safety-box">

                <div class="safety-header">

                    <strong>
                        ${escapeHTML(food.name)}
                    </strong>

                    <span class="safety-score">
                        ✓ INFO COMPLETE
                    </span>

                </div>


                <div class="check-list">

                    <div class="check-row">
                        <span>Quantity</span>
                        <strong>
                            ${food.quantity} meals
                        </strong>
                    </div>

                    <div class="check-row">
                        <span>Food type</span>
                        <strong>
                            ${escapeHTML(food.type)}
                        </strong>
                    </div>

                    <div class="check-row">
                        <span>Storage</span>
                        <strong>
                            ${escapeHTML(food.storage)}
                        </strong>
                    </div>

                    <div class="check-row">
                        <span>Prepared</span>
                        <strong>
                            ${formatDate(food.preparedRaw)}
                        </strong>
                    </div>

                    <div class="check-row">
                        <span>Best before</span>
                        <strong>
                            ${formatDate(food.expiryRaw)}
                        </strong>
                    </div>

                    <div class="check-row">
                        <span>Pickup deadline</span>
                        <strong>
                            ${formatDate(food.pickupRaw)}
                        </strong>
                    </div>

                    <div class="check-row">
                        <span>Location</span>
                        <strong>
                            ${escapeHTML(food.location)}
                        </strong>
                    </div>

                </div>

            </div>

        `;


    document
        .getElementById("claimModal")
        .classList.remove("hidden");

}


function closeClaimModal(){

    document
        .getElementById("claimModal")
        .classList.add("hidden");

    selectedFoodId =
        null;

}


/* =========================================================
   CONFIRM CLAIM
========================================================= */

function confirmClaim(){

    checkExpirySilently();


    if(!selectedFoodId){

        return;

    }


    const food =
        donations.find(
            item =>
                item.id ===
                selectedFoodId
        );


    if(
        !food ||
        food.status !==
        "Available"
    ){

        closeClaimModal();

        showToast(
            "This food has expired or was already claimed."
        );

        renderAll();

        return;

    }


    if(
        currentUser.role !==
        "ngo"
    ){

        closeClaimModal();

        showToast(
            "Only verified organizations can claim food."
        );

        return;

    }


    food.status =
        "Claimed";

    food.claimedBy =
        currentUser.email;


    claims.push({

        id:
            "CL-" +
            Math.floor(
                1000 +
                Math.random() * 9000
            ),

        donationId:
            food.id,

        organization:
            currentUser.email,

        foodName:
            food.name,

        quantity:
            food.quantity,

        status:
            "Claimed",

        pickupStatus:
            "Pending",

        createdAt:
            new Date().toISOString()

    });


    saveDonations();

    saveClaims();


    closeClaimModal();

    renderAll();


    showToast(
        "Food successfully claimed ✓"
    );

}


/* =========================================================
   TRACKING
========================================================= */

function renderTracking(){

    const container =
        document.getElementById(
            "trackingList"
        );


    if(!container) return;


    let tracked = [];


    if(
        currentUser.role ===
        "donor"
    ){

        tracked =
            donations.filter(
                food =>
                    food.owner ===
                    currentUser.email &&
                    food.status ===
                    "Claimed"
            );

    }

    else{

        tracked =
            donations.filter(
                food =>
                    food.claimedBy ===
                    currentUser.email
            );

    }


    if(tracked.length === 0){

        container.innerHTML = `

            <div class="panel">

                ${emptyState(
                    "📦",
                    "No active rescues",
                    "Tracking appears after a donation is claimed."
                )}

            </div>

        `;

        return;

    }


    container.innerHTML =
        tracked
        .map(
            food =>
                trackingCard(food)
        )
        .join("");

}


function trackingCard(food){

    const isDonor =
        currentUser.role ===
        "donor";


    return `

        <div class="track-card">

            <div class="track-top">

                <div>

                    <div class="track-name">
                        ${escapeHTML(food.name)}
                    </div>

                    <div class="track-id">
                        Rescue ID: ${food.id}
                    </div>

                </div>


                <span class="status pending">
                    CLAIMED
                </span>

            </div>


            <div class="food-meta">

                <span class="meta">
                    ${food.quantity} meals
                </span>

                <span class="meta">
                    📍 ${escapeHTML(food.location)}
                </span>

                <span class="meta">
                    Pickup:
                    ${formatDate(food.pickupRaw)}
                </span>

            </div>


            <div class="progress">


                <div class="progress-step active">

                    <div class="progress-dot">
                        ✓
                    </div>

                    <strong>
                        Listed
                    </strong>

                    <span>
                        Completed
                    </span>

                </div>


                <div class="progress-step active">

                    <div class="progress-dot">
                        ✓
                    </div>

                    <strong>
                        Claimed
                    </strong>

                    <span>
                        Completed
                    </span>

                </div>


                <div class="progress-step">

                    <div class="progress-dot">
                        3
                    </div>

                    <strong>
                        Pickup
                    </strong>

                    <span>
                        Pending
                    </span>

                </div>


                <div class="progress-step">

                    <div class="progress-dot">
                        4
                    </div>

                    <strong>
                        Completed
                    </strong>

                    <span>
                        Pending
                    </span>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   STATISTICS
========================================================= */

function updateNGOStats(){

    const available =
        donations.filter(
            food =>
                food.status ===
                "Available"
        );


    const myClaims =
        claims.filter(
            claim =>
                claim.organization ===
                currentUser.email
        );


    const meals =
        myClaims.reduce(
            (sum,claim) =>
                sum +
                Number(
                    claim.quantity || 0
                ),
            0
        );


    document
        .getElementById("availableCount")
        .textContent =
            available.length;


    document
        .getElementById("claimCount")
        .textContent =
            myClaims.length;


    document
        .getElementById("mealsRescued")
        .textContent =
            meals;

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll(){

    if(!currentUser) return;


    checkExpirySilently();


    if(
        currentUser.role ===
        "donor"
    ){

        renderDonations();

    }


    if(
        currentUser.role ===
        "ngo"
    ){

        renderAvailableFood();

        updateNGOStats();

    }


    renderTracking();

}


/* =========================================================
   TIME REMAINING
========================================================= */

function getRemainingTime(date){

    const difference =
        new Date(date).getTime()
        -
        Date.now();


    if(
        difference <= 0
    ){

        return {

            expired:true,

            text:"Expired"

        };

    }


    const minutes =
        Math.floor(
            difference /
            60000
        );


    const hours =
        Math.floor(
            minutes / 60
        );


    const remainingMinutes =
        minutes % 60;


    if(hours > 0){

        return {

            expired:false,

            text:
                `${hours}h ${remainingMinutes}m remaining`

        };

    }


    return {

        expired:false,

        text:
            `${minutes}m remaining`

    };

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date){

    if(!date){

        return "Not provided";

    }


    const parsed =
        new Date(date);


    if(
        Number.isNaN(
            parsed.getTime()
        )
    ){

        return "Invalid date";

    }


    return parsed.toLocaleString(
        [],
        {
            day:"2-digit",
            month:"short",
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}


/* =========================================================
   EMPTY STATE
========================================================= */

function emptyState(
    icon,
    title,
    description
){

    return `

        <div class="empty">

            <div class="empty-icon">
                ${icon}
            </div>

            <strong>
                ${title}
            </strong>

            <p>
                ${description}
            </p>

        </div>

    `;

}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message){

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3200
        );

}


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

document
    .getElementById("claimModal")
    .addEventListener(
        "click",
        event => {

            if(
                event.target ===
                event.currentTarget
            ){

                closeClaimModal();

            }

        }
    );


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape"
        ){

            closeClaimModal();

        }

    }
);


/* =========================================================
   AUTO REFRESH
========================================================= */

setInterval(
    () => {

        if(currentUser){

            checkExpiredDonations();

            renderAll();

        }

    },
    5000
);


/* =========================================================
   SESSION RESTORE
========================================================= */

function restoreSession(){

    loadData();


    const session =
        JSON.parse(
            localStorage.getItem(
                STORAGE_KEYS.SESSION
            )
        );


    if(session){

        currentUser =
            session;

        enterApplication();

    }
    else{

        showHome();

    }

}


/* =========================================================
   START
========================================================= */

restoreSession();