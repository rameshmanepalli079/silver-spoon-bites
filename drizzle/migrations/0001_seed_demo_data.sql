INSERT INTO public.menu_items (name, description, price, category, is_veg, is_bestseller, is_special, image_url) VALUES
('Paneer Tikka','Char-grilled cottage cheese, mint chutney',249,'Starters',true,true,false,'/images/tandoori.jpg'),
('Chicken 65','Spicy Chennai-style fried chicken',279,'Starters',false,true,true,'/images/tandoori.jpg'),
('Veg Manchurian Dry','Crisp vegetable dumplings, garlic soy',219,'Starters',true,false,false,'/images/chinese.jpg'),
('Sweet Corn Soup','Silky corn broth, spring onion',149,'Soups',true,false,false,'/images/drinks.jpg'),
('Hot & Sour Chicken Soup','Peppery broth, shredded chicken',169,'Soups',false,false,false,'/images/drinks.jpg'),
('Hyderabadi Chicken Dum Biryani','Slow-sealed basmati, saffron, raita',349,'Biryani',false,true,true,'/images/biryani.jpg'),
('Mutton Biryani','Tender mutton, long-grain basmati',429,'Biryani',false,true,false,'/images/biryani.jpg'),
('Veg Dum Biryani','Garden vegetables, whole spices',269,'Biryani',true,false,false,'/images/biryani.jpg'),
('Butter Chicken','Tandoori chicken, silky tomato butter gravy',369,'Indian',false,true,true,'/images/indian.jpg'),
('Paneer Butter Masala','Cottage cheese in cashew tomato gravy',299,'Indian',true,true,false,'/images/indian.jpg'),
('Dal Tadka','Yellow lentils, burnt garlic tempering',189,'Indian',true,false,false,'/images/indian.jpg'),
('Chilli Chicken','Wok-tossed chicken, peppers, soy',299,'Chinese',false,true,false,'/images/chinese.jpg'),
('Schezwan Paneer','Fiery schezwan, bell peppers',269,'Chinese',true,false,false,'/images/chinese.jpg'),
('Tandoori Chicken (Half)','Yoghurt marinated, clay oven roasted',329,'Tandoori',false,true,false,'/images/tandoori.jpg'),
('Malai Seekh Kebab','Creamy minced chicken skewers',319,'Tandoori',false,false,true,'/images/tandoori.jpg'),
('Tandoori Mushroom','Smoky marinated mushrooms',259,'Tandoori',true,false,false,'/images/tandoori.jpg'),
('Prawn Ghee Roast','Mangalorean spice, roasted prawns',449,'Seafood',false,true,true,'/images/seafood.jpg'),
('Fish Tikka','Marinated basa, chargrilled',389,'Seafood',false,false,false,'/images/seafood.jpg'),
('Veg Kolhapuri','Mixed vegetables, fiery kolhapuri masala',249,'Vegetarian',true,false,false,'/images/indian.jpg'),
('Palak Paneer','Creamed spinach, soft paneer',279,'Vegetarian',true,false,false,'/images/indian.jpg'),
('Chicken Lollipop','Frenched wings, hot garlic dip',289,'Non-Vegetarian',false,true,false,'/images/tandoori.jpg'),
('Mutton Rogan Josh','Kashmiri chillies, slow cooked mutton',419,'Non-Vegetarian',false,false,false,'/images/indian.jpg'),
('Jeera Rice','Basmati, cumin tempering',159,'Rice',true,false,false,'/images/biryani.jpg'),
('Egg Fried Rice','Wok fried rice, egg, scallions',199,'Rice',false,false,false,'/images/chinese.jpg'),
('Hakka Noodles','Stir-fried noodles, julienne vegetables',209,'Noodles',true,true,false,'/images/chinese.jpg'),
('Chicken Schezwan Noodles','Spicy schezwan noodles, chicken',249,'Noodles',false,false,false,'/images/chinese.jpg'),
('Butter Naan','Clay oven flatbread, butter brushed',59,'Breads',true,true,false,'/images/indian.jpg'),
('Garlic Kulcha','Stuffed garlic and coriander kulcha',79,'Breads',true,false,false,'/images/indian.jpg'),
('Gulab Jamun (2 pc)','Warm milk dumplings, rose syrup',99,'Desserts',true,true,false,'/images/dessert.jpg'),
('Double Ka Meetha','Hyderabadi bread pudding',129,'Desserts',true,false,true,'/images/dessert.jpg'),
('Lime Soda','Fresh lime, salted or sweet',79,'Beverages',true,false,false,'/images/drinks.jpg'),
('Masala Chai','Spiced Indian tea',49,'Beverages',true,false,false,'/images/drinks.jpg'),
('Mango Lassi','Thick yoghurt, alphonso mango',119,'Beverages',true,true,false,'/images/drinks.jpg');

INSERT INTO public.restaurant_tables (table_number, capacity, status) VALUES
('T1',2,'AVAILABLE'),('T2',2,'AVAILABLE'),('T3',4,'AVAILABLE'),('T4',4,'RESERVED'),
('T5',6,'AVAILABLE'),('T6',6,'OCCUPIED'),('T7',8,'AVAILABLE'),('T8',4,'CLEANING');

INSERT INTO public.reviews (customer_name, overall_rating, food_rating, service_rating, comment) VALUES
('Aarthi R.',5,5,5,'The Hyderabadi dum biryani is the real deal. Warm service too.'),
('Vikram S.',5,5,4,'Prawn ghee roast was outstanding. Will come back for the kebabs.'),
('Meera Nair',4,4,5,'Lovely ambience for family dinner, parcel packing was neat.'),
('Rahul T.',5,4,5,'Ordered parcel, pickup code system made it quick and easy.');
