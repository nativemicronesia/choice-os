-- Local Specials
insert into menu_items (name, category, description, price) values
  ('Reef Fish & Rice',       'Local Specials', 'Grilled reef fish, steamed rice, cabbage slaw', 7.50),
  ('Chuukese BBQ Chicken',   'Local Specials', 'Soy-lime marinated chicken thigh, grilled', 6.50),
  ('Spam Musubi Plate',      'Local Specials', 'Grilled Spam over rice, nori wrap, 2 pieces', 4.00),
  ('Breadfruit & Corned Beef', 'Local Specials', 'Fried breadfruit slices with corned beef gravy', 5.50);

-- Burgers & Sandwiches
insert into menu_items (name, category, description, price) values
  ('Choice Classic Burger', 'Burgers & Sandwiches', 'Beef patty, lettuce, tomato, house sauce', 4.50),
  ('Double Cheeseburger',   'Burgers & Sandwiches', 'Two patties, American cheese, pickles', 6.00),
  ('Crispy Chicken Sandwich', 'Burgers & Sandwiches', 'Fried chicken breast, mayo, shredded cabbage', 5.00),
  ('Spam & Egg Sandwich',   'Burgers & Sandwiches', 'Grilled Spam, fried egg, toasted bun', 3.50);

-- Sides
insert into menu_items (name, category, description, price) values
  ('French Fries',  'Sides', 'Crispy-cut, salted', 2.00),
  ('Fried Rice',    'Sides', 'Egg fried rice, scallion', 2.50),
  ('Coleslaw',      'Sides', 'House slaw, creamy dressing', 1.50),
  ('Onion Rings',   'Sides', 'Beer-battered, 6 pieces', 2.50);

-- Cold Drinks
insert into menu_items (name, category, description, price) values
  ('Coca-Cola (Can)',   'Cold Drinks', '12 oz', 1.50),
  ('Bottled Water',     'Cold Drinks', '16.9 oz', 1.00),
  ('Iced Tea',          'Cold Drinks', 'Unsweetened or sweet', 1.50),
  ('Tropical Punch',    'Cold Drinks', 'House-made, 16 oz', 1.75);

-- Daily specials — Banner Editor demo data: one live, one toggled off
insert into daily_specials (title, description, price, active) values
  ('Friday Fish Fry', 'Whole fried reef fish, rice, and slaw — Fridays only', 8.00, true),
  ('Sunday Chicken Special', 'Half BBQ chicken with two sides', 7.00, false);

-- A few sample orders across statuses, for exercising KDS/analytics in Phase 2
insert into orders (customer_name, status, total) values
  ('Mary',   'pending',   9.00),
  ('Joseph', 'cooking',   6.50),
  ('Selina', 'completed', 5.50);

insert into order_items (order_id, item_name, quantity, price_at_time, special_instructions)
select id, 'Choice Classic Burger', 2, 4.50, 'No onions'
from orders where customer_name = 'Mary';

insert into order_items (order_id, item_name, quantity, price_at_time, special_instructions)
select id, 'Chuukese BBQ Chicken', 1, 6.50, null
from orders where customer_name = 'Joseph';

insert into order_items (order_id, item_name, quantity, price_at_time, special_instructions)
select id, 'Breadfruit & Corned Beef', 1, 5.50, null
from orders where customer_name = 'Selina';
