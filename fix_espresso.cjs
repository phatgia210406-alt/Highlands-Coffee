const fs = require('fs');

const coffeeJsonStr = fs.readFileSync('data/coffee.json', 'utf8');
const coffeeJson = JSON.parse(coffeeJsonStr);

for (const item of coffeeJson) {
  if (item.name === 'Espresso Nóng') {
    item.image = '/assets/images/highlands_hot_cup.jpg';
  }
}

fs.writeFileSync('data/coffee.json', JSON.stringify(coffeeJson, null, 2));

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/name:'Espresso Nóng', price:45000, image:'images\/coffee\/espresso-nong.webp'/g, "name:'Espresso Nóng', price:45000, image:'/assets/images/highlands_hot_cup.jpg'");
html = html.replace(/<img src="images\/coffee\/espresso-nong.webp" alt="Espresso Nóng"/g, '<img src="/assets/images/highlands_hot_cup.jpg" alt="Espresso Nóng"');
fs.writeFileSync('index.html', html);
