const fs = require("fs");

const rawData = fs.readFileSync("stores.json", "utf8");
const stores = JSON.parse(rawData);

const hoursList = [
  "09:00 - 18:00",
  "10:00 - 20:00",
  "08:00 - 17:00",
  "11:00 - 22:00",
  "Always Open 24/7",
];

const updatedStores = stores.map((store) => {
  // Randomly generate a rating between 1.0 and 5.0 for each store
  const randomRating = (Math.random() * (5.0 - 1.0) + 1.0).toFixed(1);

  const randomHours = hoursList[Math.floor(Math.random() * hoursList.length)];

  return {
    ...store,
    phone: `+46 36 ${Math.floor(100000 + Math.random() * 900000)}`, // Include Jönköping's area code (036) in the phone number
    rating: parseFloat(randomRating),
    opening_hours: randomHours,
  };
});

fs.writeFileSync("stores.json", JSON.stringify(updatedStores, null, 2));
console.log("data updated successfully");
