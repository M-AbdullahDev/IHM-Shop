const Store = {
    // Initial data if none exists
        initialData: {
        inventory: [
          {
                    "id": "demo_signature_tee_v1",
                    "name": "Demo Signature Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "L",
                    "color": "Midnight Black",
                    "quantity": 50,
                    "price": 1500,
                    "costPrice": 900,
                    "lowStock": 10
          },
          {
                    "id": "urban_comfort_v1",
                    "name": "Urban Comfort",
                    "type": "V-Neck",
                    "style": "Plain",
                    "size": "M",
                    "color": "Pure White",
                    "quantity": 30,
                    "price": 1200,
                    "costPrice": 700,
                    "lowStock": 5
          },
          {
                    "id": "street_style_polo_v1",
                    "name": "Street Style Polo",
                    "type": "Polo",
                    "style": "Striped",
                    "size": "L",
                    "color": "Navy Blue",
                    "quantity": 15,
                    "price": 2500,
                    "costPrice": 1500,
                    "lowStock": 5
          },
          {
                    "id": "casual_oversized_v1",
                    "name": "Casual Oversized",
                    "type": "Oversized",
                    "style": "Printed",
                    "size": "XL",
                    "color": "Heather Gray",
                    "quantity": 8,
                    "price": 3200,
                    "costPrice": 2000,
                    "lowStock": 10
          },
          {
                    "id": "essential_v_neck_v1",
                    "name": "Essential V-Neck",
                    "type": "V-Neck",
                    "style": "Plain",
                    "size": "S",
                    "color": "Royal Blue",
                    "quantity": 25,
                    "price": 1100,
                    "costPrice": 650,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_black_s_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "S",
                    "color": "Black",
                    "quantity": 5,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_black_m_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "M",
                    "color": "Black",
                    "quantity": 10,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_black_l_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "L",
                    "color": "Black",
                    "quantity": 10,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_beige_s_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "S",
                    "color": "Beige",
                    "quantity": 5,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_beige_m_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "M",
                    "color": "Beige",
                    "quantity": 10,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_beige_l_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "L",
                    "color": "Beige",
                    "quantity": 10,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_brown_s_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "S",
                    "color": "Brown",
                    "quantity": 5,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_brown_m_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "M",
                    "color": "Brown",
                    "quantity": 10,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_brown_l_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "L",
                    "color": "Brown",
                    "quantity": 10,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_green_s_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "S",
                    "color": "Green",
                    "quantity": 5,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_green_m_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "M",
                    "color": "Green",
                    "quantity": 10,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_button_shirt_green_l_v1",
                    "name": "Drop Needle Button Shirt",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "L",
                    "color": "Green",
                    "quantity": 10,
                    "price": 3800,
                    "costPrice": 2000,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_black_s_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "S",
                    "color": "Black",
                    "quantity": 5,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_black_m_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "M",
                    "color": "Black",
                    "quantity": 10,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_black_l_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "L",
                    "color": "Black",
                    "quantity": 10,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_beige_s_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "S",
                    "color": "Beige",
                    "quantity": 5,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_beige_m_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "M",
                    "color": "Beige",
                    "quantity": 10,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_beige_l_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "L",
                    "color": "Beige",
                    "quantity": 10,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_brown_s_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "S",
                    "color": "Brown",
                    "quantity": 5,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_brown_m_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "M",
                    "color": "Brown",
                    "quantity": 10,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_brown_l_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "L",
                    "color": "Brown",
                    "quantity": 10,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_green_s_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "S",
                    "color": "Green",
                    "quantity": 5,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_green_m_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "M",
                    "color": "Green",
                    "quantity": 10,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "drop_needle_polo_shirt_green_l_v1",
                    "name": "Drop Needle Polo Shirt",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "L",
                    "color": "Green",
                    "quantity": 10,
                    "price": 3500,
                    "costPrice": 1800,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_black_s_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "S",
                    "color": "Black",
                    "quantity": 5,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_black_m_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "M",
                    "color": "Black",
                    "quantity": 10,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_black_l_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "L",
                    "color": "Black",
                    "quantity": 5,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_white_s_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "S",
                    "color": "White",
                    "quantity": 5,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_white_m_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "M",
                    "color": "White",
                    "quantity": 10,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_white_l_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "L",
                    "color": "White",
                    "quantity": 5,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_cream_s_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "S",
                    "color": "Cream",
                    "quantity": 5,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_cream_m_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "M",
                    "color": "Cream",
                    "quantity": 10,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_cream_l_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "L",
                    "color": "Cream",
                    "quantity": 5,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_brown_s_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "S",
                    "color": "Brown",
                    "quantity": 5,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_brown_m_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "M",
                    "color": "Brown",
                    "quantity": 10,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "cotton_zip_polo_brown_l_v1",
                    "name": "Cotton Zip Polo",
                    "type": "Polo",
                    "style": "Plain",
                    "size": "L",
                    "color": "Brown",
                    "quantity": 5,
                    "price": 3600,
                    "costPrice": 1900,
                    "lowStock": 5
          },
          {
                    "id": "knitted_tshirt_sky_blue_s_v1",
                    "name": "Knitted T-Shirt",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "S",
                    "color": "Sky Blue",
                    "quantity": 15,
                    "price": 3200,
                    "costPrice": 1600,
                    "lowStock": 5
          },
          {
                    "id": "knitted_tshirt_sky_blue_m_v1",
                    "name": "Knitted T-Shirt",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "M",
                    "color": "Sky Blue",
                    "quantity": 20,
                    "price": 3200,
                    "costPrice": 1600,
                    "lowStock": 5
          },
          {
                    "id": "knitted_tshirt_sky_blue_l_v1",
                    "name": "Knitted T-Shirt",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "L",
                    "color": "Sky Blue",
                    "quantity": 15,
                    "price": 3200,
                    "costPrice": 1600,
                    "lowStock": 5
          },
          {
                    "id": "knitted_tshirt_white_s_v1",
                    "name": "Knitted T-Shirt",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "S",
                    "color": "White",
                    "quantity": 15,
                    "price": 3200,
                    "costPrice": 1600,
                    "lowStock": 5
          },
          {
                    "id": "knitted_tshirt_white_m_v1",
                    "name": "Knitted T-Shirt",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "M",
                    "color": "White",
                    "quantity": 20,
                    "price": 3200,
                    "costPrice": 1600,
                    "lowStock": 5
          },
          {
                    "id": "knitted_tshirt_white_l_v1",
                    "name": "Knitted T-Shirt",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "L",
                    "color": "White",
                    "quantity": 15,
                    "price": 3200,
                    "costPrice": 1600,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_beige_s_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "S",
                    "color": "Beige",
                    "quantity": 6,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_beige_m_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "M",
                    "color": "Beige",
                    "quantity": 14,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_beige_l_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "L",
                    "color": "Beige",
                    "quantity": 14,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_beige_xl_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "XL",
                    "color": "Beige",
                    "quantity": 6,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_brown_s_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "S",
                    "color": "Brown",
                    "quantity": 6,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_brown_m_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "M",
                    "color": "Brown",
                    "quantity": 14,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_brown_l_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "L",
                    "color": "Brown",
                    "quantity": 14,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_brown_xl_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "XL",
                    "color": "Brown",
                    "quantity": 6,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_black_s_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "S",
                    "color": "Black",
                    "quantity": 6,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_black_m_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "M",
                    "color": "Black",
                    "quantity": 14,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_black_l_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "L",
                    "color": "Black",
                    "quantity": 14,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "straight_fit_trouser_black_xl_v1",
                    "name": "Straight Fit Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "XL",
                    "color": "Black",
                    "quantity": 6,
                    "price": 4500,
                    "costPrice": 2400,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_black_s_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "S",
                    "color": "Black",
                    "quantity": 6,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_black_m_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "M",
                    "color": "Black",
                    "quantity": 14,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_black_l_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "L",
                    "color": "Black",
                    "quantity": 14,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_black_xl_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "XL",
                    "color": "Black",
                    "quantity": 6,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_beige_s_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "S",
                    "color": "Beige",
                    "quantity": 6,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_beige_m_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "M",
                    "color": "Beige",
                    "quantity": 14,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_beige_l_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "L",
                    "color": "Beige",
                    "quantity": 14,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_beige_xl_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "XL",
                    "color": "Beige",
                    "quantity": 6,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_brown_s_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "S",
                    "color": "Brown",
                    "quantity": 6,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_brown_m_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "M",
                    "color": "Brown",
                    "quantity": 14,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_brown_l_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "L",
                    "color": "Brown",
                    "quantity": 14,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "terry_baggy_trouser_brown_xl_v1",
                    "name": "Terry Baggy Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "XL",
                    "color": "Brown",
                    "quantity": 6,
                    "price": 4800,
                    "costPrice": 2600,
                    "lowStock": 5
          },
          {
                    "id": "tank_top_black_m_v1",
                    "name": "Tank Top",
                    "type": "Tank Top",
                    "style": "Plain",
                    "size": "M",
                    "color": "Black",
                    "quantity": 17,
                    "price": 1800,
                    "costPrice": 900,
                    "lowStock": 5
          },
          {
                    "id": "tank_top_black_l_v1",
                    "name": "Tank Top",
                    "type": "Tank Top",
                    "style": "Plain",
                    "size": "L",
                    "color": "Black",
                    "quantity": 17,
                    "price": 1800,
                    "costPrice": 900,
                    "lowStock": 5
          },
          {
                    "id": "tank_top_white_m_v1",
                    "name": "Tank Top",
                    "type": "Tank Top",
                    "style": "Plain",
                    "size": "M",
                    "color": "White",
                    "quantity": 17,
                    "price": 1800,
                    "costPrice": 900,
                    "lowStock": 5
          },
          {
                    "id": "tank_top_white_l_v1",
                    "name": "Tank Top",
                    "type": "Tank Top",
                    "style": "Plain",
                    "size": "L",
                    "color": "White",
                    "quantity": 17,
                    "price": 1800,
                    "costPrice": 900,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_black_s_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "S",
                    "color": "Black",
                    "quantity": 6,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_black_m_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "M",
                    "color": "Black",
                    "quantity": 12,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_black_l_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "L",
                    "color": "Black",
                    "quantity": 12,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_black_xl_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "XL",
                    "color": "Black",
                    "quantity": 6,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_white_s_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "S",
                    "color": "White",
                    "quantity": 6,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_white_m_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "M",
                    "color": "White",
                    "quantity": 12,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_white_l_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "L",
                    "color": "White",
                    "quantity": 12,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_white_xl_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "XL",
                    "color": "White",
                    "quantity": 6,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_gray_s_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "S",
                    "color": "Gray",
                    "quantity": 6,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_gray_m_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "M",
                    "color": "Gray",
                    "quantity": 12,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_gray_l_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "L",
                    "color": "Gray",
                    "quantity": 12,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_gray_xl_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "XL",
                    "color": "Gray",
                    "quantity": 6,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_green_s_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "S",
                    "color": "Green",
                    "quantity": 6,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_green_m_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "M",
                    "color": "Green",
                    "quantity": 12,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_green_l_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "L",
                    "color": "Green",
                    "quantity": 12,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "regular_tee_green_xl_v1",
                    "name": "Regular Tee",
                    "type": "Round Neck",
                    "style": "Plain",
                    "size": "XL",
                    "color": "Green",
                    "quantity": 6,
                    "price": 2800,
                    "costPrice": 1400,
                    "lowStock": 5
          },
          {
                    "id": "linen_trouser_ash_white_s_v1",
                    "name": "Linen Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "S",
                    "color": "Ash White",
                    "quantity": 6,
                    "price": 4200,
                    "costPrice": 2200,
                    "lowStock": 5
          },
          {
                    "id": "linen_trouser_ash_white_m_v1",
                    "name": "Linen Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "M",
                    "color": "Ash White",
                    "quantity": 12,
                    "price": 4200,
                    "costPrice": 2200,
                    "lowStock": 5
          },
          {
                    "id": "linen_trouser_ash_white_l_v1",
                    "name": "Linen Trouser",
                    "type": "Trouser",
                    "style": "Plain",
                    "size": "L",
                    "color": "Ash White",
                    "quantity": 12,
                    "price": 4200,
                    "costPrice": 2200,
                    "lowStock": 5
          },
          {
                    "id": "linen_shirt_full_sleeves_offwhite_s_v1",
                    "name": "Linen Shirt Full Sleeves",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "S",
                    "color": "Off-White",
                    "quantity": 6,
                    "price": 3900,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "linen_shirt_full_sleeves_offwhite_m_v1",
                    "name": "Linen Shirt Full Sleeves",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "M",
                    "color": "Off-White",
                    "quantity": 12,
                    "price": 3900,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "linen_shirt_full_sleeves_offwhite_l_v1",
                    "name": "Linen Shirt Full Sleeves",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "L",
                    "color": "Off-White",
                    "quantity": 12,
                    "price": 3900,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "linen_shirt_full_sleeves_olive_s_v1",
                    "name": "Linen Shirt Full Sleeves",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "S",
                    "color": "Olive",
                    "quantity": 6,
                    "price": 3900,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "linen_shirt_full_sleeves_olive_m_v1",
                    "name": "Linen Shirt Full Sleeves",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "M",
                    "color": "Olive",
                    "quantity": 12,
                    "price": 3900,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "linen_shirt_full_sleeves_olive_l_v1",
                    "name": "Linen Shirt Full Sleeves",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "L",
                    "color": "Olive",
                    "quantity": 12,
                    "price": 3900,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "linen_shirt_full_sleeves_sky_blue_s_v1",
                    "name": "Linen Shirt Full Sleeves",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "S",
                    "color": "Sky Blue",
                    "quantity": 6,
                    "price": 3900,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "linen_shirt_full_sleeves_sky_blue_m_v1",
                    "name": "Linen Shirt Full Sleeves",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "M",
                    "color": "Sky Blue",
                    "quantity": 12,
                    "price": 3900,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "linen_shirt_full_sleeves_sky_blue_l_v1",
                    "name": "Linen Shirt Full Sleeves",
                    "type": "Shirt",
                    "style": "Plain",
                    "size": "L",
                    "color": "Sky Blue",
                    "quantity": 12,
                    "price": 3900,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "leather_moto_jacket_v1",
                    "name": "Leather Moto Jacket",
                    "type": "Leather Jacket",
                    "style": "Premium",
                    "size": "L",
                    "color": "Midnight Black",
                    "quantity": 10,
                    "price": 12500,
                    "costPrice": 7500,
                    "lowStock": 2
          },
          {
                    "id": "suede_trucker_jacket_v1",
                    "name": "Suede Trucker Jacket",
                    "type": "Suede Jacket",
                    "style": "Vintage",
                    "size": "M",
                    "color": "Tobacco",
                    "quantity": 8,
                    "price": 11000,
                    "costPrice": 6200,
                    "lowStock": 2
          },
          {
                    "id": "puffer_down_jacket_v1",
                    "name": "Arctic Puffer Jacket",
                    "type": "Puffer Jacket",
                    "style": "Quilted",
                    "size": "XL",
                    "color": "Navy",
                    "quantity": 15,
                    "price": 8500,
                    "costPrice": 4800,
                    "lowStock": 5
          },
          {
                    "id": "fur_collar_overcoat_v1",
                    "name": "Fur Collar Overcoat",
                    "type": "Fur Jacket",
                    "style": "Formal",
                    "size": "L",
                    "color": "Charcoal",
                    "quantity": 6,
                    "price": 14000,
                    "costPrice": 8200,
                    "lowStock": 2
          },
          {
                    "id": "cable_knit_sweater_v1",
                    "name": "Cable Knit Sweater",
                    "type": "Sweater",
                    "style": "Handmade",
                    "size": "M",
                    "color": "Off-White",
                    "quantity": 20,
                    "price": 4500,
                    "costPrice": 2100,
                    "lowStock": 5
          },
          {
                    "id": "half_sleeve_merino_sweater_v1",
                    "name": "Merino Half Sleeve",
                    "type": "Half-Sleeve Sweater",
                    "style": "Slim Fit",
                    "size": "S",
                    "color": "Burgundy",
                    "quantity": 12,
                    "price": 3500,
                    "costPrice": 1600,
                    "lowStock": 4
          }
],
        accessories: [
            {
                "id": "premium_chrono_watch_v1",
                "name": "Premium Chrono Watch",
                "type": "Watches",
                "style": "Metal",
                "size": "N/A",
                "color": "Silver",
                "quantity": 15,
                "price": 12000,
                "costPrice": 7000,
                "lowStock": 3
            },
            {
                "id": "classic_leather_belt_v1",
                "name": "Classic Leather Belt",
                "type": "Belt",
                "style": "Leather",
                "size": "M",
                "color": "Brown",
                "quantity": 25,
                "price": 2500,
                "costPrice": 1200,
                "lowStock": 5
            },
            {
                "id": "silver_cuban_chain_v1",
                "name": "Silver Cuban Chain",
                "type": "Chains",
                "style": "Plain",
                "size": "N/A",
                "color": "Silver",
                "quantity": 20,
                "price": 3500,
                "costPrice": 1800,
                "lowStock": 4
            },
            {
                "id": "minimalist_steel_bracelet_v1",
                "name": "Minimalist Steel Bracelet",
                "type": "Bracelett",
                "style": "Plain",
                "size": "N/A",
                "color": "Black",
                "quantity": 30,
                "price": 1800,
                "costPrice": 800,
                "lowStock": 5
            },
            {
                "id": "performance_crew_socks_v1",
                "name": "Performance Crew Socks",
                "type": "Socks",
                "style": "Athletic",
                "size": "L",
                "color": "White",
                "quantity": 100,
                "price": 600,
                "costPrice": 250,
                "lowStock": 15
            },
            {
                "id": "compression_arm_sleeves_v1",
                "name": "Compression Arm Sleeves",
                "type": "Arms Sleves",
                "style": "Athletic",
                "size": "M",
                "color": "Midnight Black",
                "quantity": 40,
                "price": 1200,
                "costPrice": 500,
                "lowStock": 8
            },
            {
                "id": "bamboo_cotton_trunks_v1",
                "name": "Bamboo Cotton Trunks",
                "type": "Underwears",
                "style": "Plain",
                "size": "L",
                "color": "Dark Gray",
                "quantity": 50,
                "price": 1500,
                "costPrice": 700,
                "lowStock": 10
            }
            ,
            {
                "id": "elegant_diamond_ring_v1",
                "name": "Elegant Diamond Ring",
                "type": "Rings",
                "style": "Gold",
                "size": "N/A",
                "color": "Gold",
                "quantity": 10,
                "price": 8000,
                "costPrice": 4000,
                "lowStock": 2
            },
            {
                "id": "classic_sunglasses_v1",
                "name": "Classic Sunglasses",
                "type": "Glasses",
                "style": "Aviator",
                "size": "N/A",
                "color": "Black",
                "quantity": 30,
                "price": 3000,
                "costPrice": 1500,
                "lowStock": 5
            },
            {
                "id": "comfort_cotton_briefs_v1",
                "name": "Comfort Cotton Briefs",
                "type": "Underwears",
                "style": "Plain",
                "size": "M",
                "color": "White",
                "quantity": 80,
                "price": 900,
                "costPrice": 400,
                "lowStock": 10
            },
            {
                "id": "signature_eau_de_parfum_v1",
                "name": "Signature Eau de Parfum",
                "type": "Perfume",
                "style": "Fragrance",
                "size": "N/A",
                "color": "N/A",
                "quantity": 25,
                "price": 5500,
                "costPrice": 2500,
                "lowStock": 5
            },
            {
                "id": "wayfarer_classic_black_v1",
                "name": "Wayfarer Classic",
                "type": "Glasses",
                "style": "Retro",
                "size": "N/A",
                "color": "Black",
                "quantity": 12,
                "price": 4500,
                "costPrice": 2200,
                "lowStock": 3
            },
            {
                "id": "ocean_breeze_perfume_v1",
                "name": "Ocean Breeze",
                "type": "Perfume",
                "style": "Fresh",
                "size": "100ml",
                "color": "N/A",
                "quantity": 15,
                "price": 6800,
                "costPrice": 3500,
                "lowStock": 5
            },
            {
                "id": "seamless_sport_briefs_black_l_v1",
                "name": "Seamless Sport Briefs",
                "type": "Underwears",
                "style": "Athletic",
                "size": "L",
                "color": "Black",
                "quantity": 40,
                "price": 1800,
                "costPrice": 850,
                "lowStock": 10
            }
        ],
        sales: [],
        returns: []
    },

    init() {
        if (!localStorage.getItem('zyro_data')) {
            localStorage.setItem('zyro_data', JSON.stringify(this.initialData));
        } else {
            // Migration: Convert numeric IDs to underscored names if needed
            const data = this.getData();
            let changed = false;

            if (!data.inventory) {
                data.inventory = [...(this.initialData.inventory || [])];
                changed = true;
            }

            if (!data.accessories) {
                data.accessories = [...(this.initialData.accessories || [])];
                changed = true;
            }

            if (!data.sales) {
                data.sales = [];
                changed = true;
            }

            if (!data.returns) {
                data.returns = [];
                changed = true;
            }

            if (!data.deletedIds) {
                data.deletedIds = [];
                changed = true;
            }

            if (!data.deletedSaleIds) {
                data.deletedSaleIds = [];
                changed = true;
            }

            // Migration: Merge new Winter Collection products into existing inventory
            if (!data.winter_collection_migrated) {
                if (this.initialData && Array.isArray(this.initialData.inventory)) {
                    this.initialData.inventory.forEach(seedProd => {
                        const exists = data.inventory && data.inventory.some(p => p && p.id === seedProd.id);
                        if (!exists) {
                            data.inventory.push({ ...seedProd });
                            changed = true;
                            console.log('Migration: Added missing product to inventory:', seedProd.name);
                        }
                    });
                }
                data.winter_collection_migrated = true;
                changed = true;
            }

            if (Array.isArray(data.inventory)) {
                data.inventory.forEach(product => {
                    if (product && typeof product.id === 'number') {
                        product.id = this.generateIdFromName(product.name);
                        changed = true;
                    }
                });
            }

            if (Array.isArray(data.accessories)) {
                data.accessories.forEach(acc => {
                    if (acc && typeof acc.id === 'number') {
                        acc.id = this.generateIdFromName(acc.name);
                        changed = true;
                    }
                });
            }

            // Merge any new accessories from the code's initialData into existing localStorage
            if (!data.accessories_migrated) {
                if (this.initialData && Array.isArray(this.initialData.accessories)) {
                    this.initialData.accessories.forEach(seedAcc => {
                        const exists = data.accessories && data.accessories.some(a => a && a.name === seedAcc.name);
                        if (!exists) {
                            const accToAdd = { ...seedAcc };
                            accToAdd.id = this.generateIdFromName(seedAcc.name);
                            data.accessories.push(accToAdd);
                            changed = true;
                            console.log('Migration: Added missing accessory to localStorage:', seedAcc.name);
                        }
                    });
                }
                data.accessories_migrated = true;
                changed = true;
            }

            // Do not re-add initial seed items on every startup.
            // Initial data should only be used for first-time installs
            // and not restore deleted items after the user removes them.
            if (changed) {
                this.saveData(data);
                console.log('Migration: Updated localStorage item IDs and accessory array.');
                window.dispatchEvent(new CustomEvent('inventoryUpdate'));
            }
        }
    },

    getData() {
        try {
            const data = JSON.parse(localStorage.getItem('zyro_data'));
            if (data && typeof data === 'object') {
                if (Array.isArray(data.inventory)) {
                    data.inventory = data.inventory.filter(p => p && typeof p === 'object' && p.id && p.name);
                } else {
                    data.inventory = [];
                }
                if (Array.isArray(data.accessories)) {
                    data.accessories = data.accessories.filter(a => a && typeof a === 'object' && a.id && a.name);
                } else {
                    data.accessories = [];
                }
                if (!Array.isArray(data.sales)) data.sales = [];
                if (!Array.isArray(data.returns)) data.returns = [];
                if (!Array.isArray(data.deletedIds)) data.deletedIds = [];
                if (!Array.isArray(data.deletedSaleIds)) data.deletedSaleIds = [];
                return data;
            }
        } catch (e) {
            console.error('Error parsing zyro_data:', e);
        }
        return { inventory: [], accessories: [], sales: [], returns: [], deletedIds: [], deletedSaleIds: [] };
    },

    saveData(data) {
        if (data && typeof data === 'object') {
            if (Array.isArray(data.inventory)) {
                data.inventory = data.inventory.filter(p => p && typeof p === 'object' && p.id && p.name);
            }
            if (Array.isArray(data.accessories)) {
                data.accessories = data.accessories.filter(a => a && typeof a === 'object' && a.id && a.name);
            }
        }
        localStorage.setItem('zyro_data', JSON.stringify(data));
    },

    // Inventory Helpers
    getInventory() {
        const data = this.getData();
        return (data && data.inventory) || [];
    },

    getAccessories() {
        const data = this.getData();
        return (data && data.accessories) || [];
    },

    generateIdFromName(name) {
        const safeName = typeof name === 'string' ? name : 'product';
        return safeName.toLowerCase()
            .trim()
            .replace(/\s+/g, '_')           // Replace spaces with underscores
            .replace(/[^a-z0-9_]/g, '')      // Remove special characters
            + '_' + Math.random().toString(36).substring(2, 5); // Add a small random suffix to avoid collisions
    },

    normalizeVariantText(value) {
        return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
    },

    isSameVariant(a, b) {
        return this.normalizeVariantText(a.name) === this.normalizeVariantText(b.name) &&
            this.normalizeVariantText(a.color) === this.normalizeVariantText(b.color) &&
            this.normalizeVariantText(a.size) === this.normalizeVariantText(b.size);
    },

    findMatchingVariant(items, target, excludeId = null) {
        return items.find(item => item.id !== excludeId && this.isSameVariant(item, target));
    },

    updateInventory(newInventory) {
        const data = this.getData();
        data.inventory = newInventory;
        this.saveData(data);
    },

    updateAccessories(newAccessories) {
        const data = this.getData();
        data.accessories = newAccessories;
        this.saveData(data);
    },

    addProduct(product) {
        const data = this.getData();
        const existing = this.findMatchingVariant(data.inventory, product);
        if (existing) {
            existing.quantity = (parseInt(existing.quantity) || 0) + (parseInt(product.quantity) || 0);
            existing.price = product.price;
            existing.costPrice = product.costPrice;
            existing.lowStock = product.lowStock;
            this.saveData(data);
            return existing;
        }
        product.id = this.generateIdFromName(product.name);
        data.inventory.push(product);
        this.saveData(data);
        return product;
    },

    addAccessory(accessory) {
        const data = this.getData();
        if (!data.accessories) data.accessories = [];
        const existing = this.findMatchingVariant(data.accessories, accessory);
        if (existing) {
            existing.quantity = (parseInt(existing.quantity) || 0) + (parseInt(accessory.quantity) || 0);
            existing.price = accessory.price;
            existing.costPrice = accessory.costPrice;
            existing.lowStock = accessory.lowStock;
            this.saveData(data);
            return existing;
        }
        accessory.id = this.generateIdFromName(accessory.name);
        data.accessories.push(accessory);
        this.saveData(data);
        return accessory;
    },

    deleteProduct(id) {
        const data = this.getData();
        data.inventory = data.inventory.filter(p => p.id !== id);
        if (data.accessories) {
            data.accessories = data.accessories.filter(a => a.id !== id);
        }
        if (!data.deletedIds) data.deletedIds = [];
        if (!data.deletedIds.includes(id)) {
            data.deletedIds.push(id);
        }
        this.saveData(data);
    },

    deleteProductGroup(name) {
        const data = this.getData();
        const deletedIds = data.inventory.filter(p => p.name === name).map(p => p.id);
        data.inventory = data.inventory.filter(p => p.name !== name);
        if (data.accessories) {
            const deletedAccIds = data.accessories.filter(a => a.name === name).map(a => a.id);
            data.accessories = data.accessories.filter(a => a.name !== name);
            deletedIds.push(...deletedAccIds);
        }
        if (!data.deletedIds) data.deletedIds = [];
        deletedIds.forEach(id => {
            if (!data.deletedIds.includes(id)) {
                data.deletedIds.push(id);
            }
        });
        this.saveData(data);
        return deletedIds;
    },

    updateProduct(id, updatedData) {
        const data = this.getData();
        const index = data.inventory.findIndex(p => p.id === id);
        if (index !== -1) {
            data.inventory[index] = { ...data.inventory[index], ...updatedData };
            this.saveData(data);
            return data.inventory[index];
        }
        if (data.accessories) {
            const accIndex = data.accessories.findIndex(a => a.id === id);
            if (accIndex !== -1) {
                data.accessories[accIndex] = { ...data.accessories[accIndex], ...updatedData };
                this.saveData(data);
                return data.accessories[accIndex];
            }
        }
        return null;
    },

    // Sales Helpers
    getSales() {
        const data = this.getData();
        return (data && data.sales) || [];
    },

    getReturns() {
        const data = this.getData();
        return (data && data.returns) || [];
    },

    addSale(sale) {
        const data = this.getData();
        sale.id = 'INV-' + Date.now().toString().slice(-6).toUpperCase();
        sale.timestamp = new Date().toISOString();
        data.sales.push(sale);
        
        // Update stock
        sale.items.forEach(item => {
            const product = data.inventory.find(p => p.id === item.id);
            if (product) {
                product.quantity -= item.quantity;
            } else if (data.accessories) {
                const accessory = data.accessories.find(a => a.id === item.id);
                if (accessory) {
                    accessory.quantity -= item.quantity;
                }
            }
        });

        this.saveData(data);
        return sale;
    },

    clearSales() {
        const data = this.getData();
        data.sales = [];
        data.returns = [];
        this.saveData(data);
    },

    deleteSale(saleId) {
        const data = this.getData();
        const saleIndex = data.sales.findIndex(s => s && s.id === saleId);
        if (saleIndex === -1) return false;

        const sale = data.sales[saleIndex];
        
        // Restore stock
        if (sale.items) {
            sale.items.forEach(item => {
                if (!item) return;
                const product = data.inventory.find(p => p && p.id === item.id);
                if (product) {
                    product.quantity = (product.quantity || 0) + parseInt(item.quantity || 0);
                } else if (data.accessories) {
                    const accessory = data.accessories.find(a => a && a.id === item.id);
                    if (accessory) {
                        accessory.quantity = (accessory.quantity || 0) + parseInt(item.quantity || 0);
                    }
                }
            });
        }

        data.sales.splice(saleIndex, 1);
        
        if (!data.deletedSaleIds) data.deletedSaleIds = [];
        if (!data.deletedSaleIds.includes(saleId)) {
            data.deletedSaleIds.push(saleId);
        }

        this.saveData(data);
        return true;
    }
};

window.Store = Store;
