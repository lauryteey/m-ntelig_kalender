// Oppretter en ny dato
let date = new Date();
let year = date.getFullYear(); // Henter året
let month = date.getMonth(); // Henter måneden (0-indeksert: 0 = Januar, 11 = Desember)

const day = document.querySelector(".calendar-dates"); // Henter elementet som viser datoene
const currentdate = document.querySelector(".calendar-current-date"); // Henter elementet som viser måned og år
const prenexIcons = document.querySelectorAll(".calendar-navigation span"); // Henter navigeringsikonene (forrige/neste måned)

// Array med navn på månedene for visning i kalenderen
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Lager en HTML-representasjon av en dato
const createDateElement = (dayNumber, isActive = false, isInactive = false) => {
    const activeClass = isActive ? "active" : ""; // Hvis datoen er dagens dato, legges klassen "active"
    const inactiveClass = isInactive ? "inactive" : ""; // Hvis datoen er utenfor gjeldende måned, legges klassen "inactive"
    return `<li class="${activeClass} ${inactiveClass}">${dayNumber}</li>`; // Returnerer HTML for datoen
};

// Legger til datoer fra forrige måned
const addPreviousMonthDays = (dayone, monthlastdate) => {
    let result = "";
    for (let i = dayone; i > 0; i--) {
        result += createDateElement(monthlastdate - i + 1, false, true); // Legger til inaktive datoer fra forrige måned
    }
    return result;
};

// Legger til datoer for aktuell måned
const addCurrentMonthDays = (lastdate, currentdate, month, year) => {
    let result = "";
    for (let i = 1; i <= lastdate; i++) {
        const isToday = i === currentdate.getDate() && month === currentdate.getMonth() && year === currentdate.getFullYear(); // Sjekker om det er dagens dato
        result += createDateElement(i, isToday); // Legger til datoen med eller uten "active"-klasse
    }
    return result;
};

// Legger til datoer for neste måned
const addNextMonthDays = (dayend) => {
    let result = "";
    for (let i = dayend; i < 6; i++) {
        result += createDateElement(i - dayend + 1, false, true); // Legger til inaktive datoer fra neste måned
    }
    return result;
};

// Hovedfunksjon for å oppdatere kalenderen
const manipulate = () => {
    const currentdateObj = new Date(); // Oppretter et nytt Date-objekt for dagens dato
    const dayone = new Date(year, month, 1).getDay(); // Finner ukedagen for den første dagen i måneden
    const lastdate = new Date(year, month + 1, 0).getDate(); // Finner siste dato i måneden
    const dayend = new Date(year, month, lastdate).getDay(); // Finner ukedagen for siste dato i måneden
    const monthlastdate = new Date(year, month, 0).getDate(); // Finner siste dato i forrige måned

    // Kombinerer HTML-innhold for kalenderen
    let lit = addPreviousMonthDays(dayone, monthlastdate); // Legger til datoer fra forrige måned
    lit += addCurrentMonthDays(lastdate, currentdateObj, month, year); // Legger til datoer for inneværende måned
    lit += addNextMonthDays(dayend); // Legger til datoer for neste måned

    // Oppdaterer tekst og datoer i kalenderen
    currentdate.innerText = `${months[month]} ${year}`; // Viser aktuell måned og år
    day.innerHTML = lit; // Oppdaterer HTML for datoene i kalenderen
};

// Funksjon for å legge til klikk-hendelser for datoer
const attachDateListeners = () => {
    const dates = document.querySelectorAll(".calendar-dates li"); // Henter alle datoelementer
    dates.forEach(date => {
        date.addEventListener("click", () => {
            console.log("Dato klikket:", date.innerText); // Logger datoen som ble klikket
            showEventPopup(date.innerText); // Viser pop-up for å opprette eller vise hendelser
        });
    });
};

// Kaller hovedfunksjonen for å oppdatere kalenderen
manipulate();
attachDateListeners(); // Legger til lyttere for datoene

// Legger til navigasjonslogikk for forrige/neste måned
prenexIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        month = icon.id === "calendar-prev" ? month - 1 : month + 1; // Justerer måned basert på knapp

        if (month < 0 || month > 11) { // Håndterer endring av år
            date = new Date(year, month, 1); // Oppdaterer datoobjekt
            year = date.getFullYear(); // Oppdaterer året
            month = date.getMonth(); // Oppdaterer måneden
        }

        manipulate(); // Oppdaterer kalenderen for den nye måneden
    });
});

// Legger til en submit-hendelse for event-skjemaet
document.getElementById('event-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Hindrer standard skjemaoppførsel (GET)

    const eventName = document.getElementById('event-name').value; // Henter navn på hendelse
    const eventDate = document.getElementById('event-date').value; // Henter dato og tid for hendelse
    const eventPlace = document.getElementById('event-place').value; // Henter sted for hendelse

    if (!eventName || !eventDate || !eventPlace) { // Sjekker at nødvendige felter er fylt ut
        alert("Vennligst fyll ut alle nødvendige felter."); // Feilmelding hvis felter mangler
        return;
    }

    const formData = {
        dato: eventDate.split('T')[0], // Dato
        klokkeslett: eventDate.split('T')[1], // Klokkeslett
        beskrivelse: eventName,
        navn_prosjektet: eventPlace,
    };

    try {
        const response = await fetch('/add_event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData), // Sender JSON-data
        });

        const result = await response.json();

        if (response.ok) {
            alert('Hendelsen ble lagret!'); // Melding om at det klartes
            hideEventPopup(); // Skjuler pop-up
        } else {
            alert(result.error || 'Kunne ikke lagre hendelsen.'); // Feilmelding fra serveren
        }
    } catch (error) {
        console.error('Feil under lagring:', error); // Logger feil
        alert('En feil oppsto. Vennligst prøv igjen.'); // Viser generell feilmelding
    }
});

// Funksjon for å vise pop-up for å legge til hendelser
const showEventPopup = (selectedDate) => {
    const popup = document.getElementById("event-modal"); // Henter pop-up-element
    if (!popup) {
        console.error("Pop-up-elementet finnes ikke!");
        return;
    }

    popup.classList.remove("hidden"); // Fjerner "hidden"-klassen for å vise pop-up
    const eventDateInput = document.getElementById("event-date"); // Henter dato-inputfeltet
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}T12:00`;
    eventDateInput.value = formattedDate; // Setter valgt dato i input-feltet
};

// Funksjon for å skjule pop-up
const hideEventPopup = () => {
    const popup = document.getElementById("event-modal");
    if (popup) popup.classList.add("hidden"); // Legger til "hidden"-klassen for å skjule pop-up
};




// Kjøres når DOM-en (HTML-siden) er ferdig lastet
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form"); // Henter login-skjemaet fra HTML
    const loginMessage = document.getElementById("login-message"); // Henter elementet for å vise login-meldinger

    if (loginForm) {
        // Lytter etter innsending av skjemaet
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Hindrer standard innsending av skjemaet

            // Henter verdier fra inputfeltene for e-post og passord
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            // Sjekker om e-post og passord er fylt ut
            if (!email || !password) {
                loginMessage.textContent = "Vennligst fyll inn både e-post og passord."; // Viser feilmelding
                loginMessage.style.color = "red"; // Endrer tekstfargen til rød
                return; // Stopper funksjonen hvis felter mangler
            }

            try {
                // Sender login-data til serveren
                const response = await fetch("/login", {
                    method: "POST", // Bruker POST-metoden
                    headers: { "Content-Type": "application/json" }, // Setter innholdstypen til JSON
                    body: JSON.stringify({ e_post: email, passord: password }), // Konverterer e-post og passord til JSON
                });

                if (!response.ok) {
                    // Hvis login feilet, henter feilmeldingen fra serveren
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Innlogging mislyktes.");
                }

                const result = await response.json(); // Henter suksessdata fra serveren
                console.log("Innlogging vellykket, yay!:", result.message); // Logger suksessmeldingen
                window.location.href = result.redirect || "/calendar"; // Omadresserer brukeren til kalenderen
            } catch (error) {
                console.error("En feil oppsto under innlogging:", error); // Logger feilen i konsollen
                loginMessage.textContent = error.message || "Feil e-post eller passord."; // Viser feilmeldingen til brukeren
                loginMessage.style.color = "red"; // Endrer tekstfargen til rød
            }
        });
    }
});
