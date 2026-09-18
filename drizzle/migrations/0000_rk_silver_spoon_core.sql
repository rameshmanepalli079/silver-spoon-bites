-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('customer','owner','staff','kitchen');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  mobile text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_team(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('owner','staff','kitchen'))
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_team(auth.uid()));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_team(auth.uid()));

-- new users: profile + customer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mobile, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'mobile', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ MENU ============
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  is_veg boolean NOT NULL DEFAULT true,
  is_available boolean NOT NULL DEFAULT true,
  is_bestseller boolean NOT NULL DEFAULT false,
  is_special boolean NOT NULL DEFAULT false,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu public read" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "menu owner manage" ON public.menu_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));

-- ============ TABLES ============
CREATE TABLE public.restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number text NOT NULL UNIQUE,
  capacity int NOT NULL DEFAULT 2,
  status text NOT NULL DEFAULT 'AVAILABLE',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.restaurant_tables TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_tables TO authenticated;
GRANT ALL ON public.restaurant_tables TO service_role;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tables public read" ON public.restaurant_tables FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tables team update" ON public.restaurant_tables FOR UPDATE TO authenticated USING (public.is_team(auth.uid()));
CREATE POLICY "tables owner insert" ON public.restaurant_tables FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'owner'));
CREATE POLICY "tables owner delete" ON public.restaurant_tables FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'owner'));

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_type text NOT NULL CHECK (order_type IN ('DINE_IN','PARCEL')),
  table_number text,
  instructions text,
  pickup_code text,
  status text NOT NULL DEFAULT 'PLACED',
  payment_status text NOT NULL DEFAULT 'PENDING',
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders read" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_team(auth.uid()));
CREATE POLICY "orders team update" ON public.orders FOR UPDATE TO authenticated
  USING (public.is_team(auth.uid()) OR auth.uid() = user_id);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0)
);
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_team(auth.uid()))));

-- ============ RESERVATIONS ============
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_code text NOT NULL UNIQUE,
  verify_code text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  mobile text NOT NULL,
  guests int NOT NULL CHECK (guests > 0),
  reserved_date date NOT NULL,
  reserved_time text NOT NULL,
  seating text,
  request text,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "res read" ON public.reservations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_team(auth.uid()));
CREATE POLICY "res insert own" ON public.reservations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "res update" ON public.reservations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_team(auth.uid()));

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_code text NOT NULL,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'DEMO PAID',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments read" ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_team(auth.uid()))));

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_name text NOT NULL DEFAULT 'Guest',
  overall_rating int NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  food_rating int CHECK (food_rating BETWEEN 1 AND 5),
  service_rating int CHECK (service_rating BETWEEN 1 AND 5),
  comment text,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (is_approved OR user_id = auth.uid() OR public.is_team(auth.uid()));
CREATE POLICY "reviews insert own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ SECURE ORDER PLACEMENT (prices from DB) ============
CREATE OR REPLACE FUNCTION public.place_order(
  _items jsonb, _order_type text, _table_number text DEFAULT NULL, _instructions text DEFAULT NULL
) RETURNS public.orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _order public.orders;
  _code text;
  _pickup text;
  _total numeric(10,2) := 0;
  _row jsonb;
  _mi public.menu_items;
  _qty int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _order_type NOT IN ('DINE_IN','PARCEL') THEN RAISE EXCEPTION 'Invalid order type'; END IF;
  IF jsonb_array_length(_items) = 0 THEN RAISE EXCEPTION 'Cart is empty'; END IF;

  _code := 'SS' || lpad((floor(random()*9000)+1000)::int::text, 4, '0');
  _pickup := CASE WHEN _order_type = 'PARCEL' THEN lpad((floor(random()*90000)+10000)::int::text, 5, '0') ELSE NULL END;

  INSERT INTO public.orders (order_code, user_id, order_type, table_number, instructions, pickup_code, total)
  VALUES (_code, _uid, _order_type, _table_number, _instructions, _pickup, 0)
  RETURNING * INTO _order;

  FOR _row IN SELECT * FROM jsonb_array_elements(_items) LOOP
    SELECT * INTO _mi FROM public.menu_items WHERE id = (_row->>'id')::uuid AND is_available;
    IF NOT FOUND THEN RAISE EXCEPTION 'Item unavailable'; END IF;
    _qty := GREATEST(1, LEAST(50, COALESCE((_row->>'quantity')::int, 1)));
    INSERT INTO public.order_items (order_id, menu_item_id, item_name, unit_price, quantity)
    VALUES (_order.id, _mi.id, _mi.name, _mi.price, _qty);
    _total := _total + (_mi.price * _qty);
  END LOOP;

  UPDATE public.orders SET total = _total WHERE id = _order.id RETURNING * INTO _order;
  RETURN _order;
END; $$;

CREATE OR REPLACE FUNCTION public.pay_order(_order_id uuid, _method text)
RETURNS public.payments LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _o public.orders; _p public.payments;
BEGIN
  SELECT * INTO _o FROM public.orders WHERE id = _order_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  INSERT INTO public.payments (payment_code, order_id, amount, method, status)
  VALUES ('PAY' || lpad((floor(random()*900000)+100000)::int::text,6,'0'), _o.id, _o.total, _method, 'DEMO PAID')
  RETURNING * INTO _p;
  UPDATE public.orders SET payment_status = 'DEMO PAID', updated_at = now() WHERE id = _o.id;
  RETURN _p;
END; $$;

CREATE OR REPLACE FUNCTION public.verify_pickup(_order_id uuid, _code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ok boolean;
BEGIN
  IF NOT public.is_team(auth.uid()) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT (pickup_code = _code) INTO _ok FROM public.orders WHERE id = _order_id;
  IF COALESCE(_ok,false) THEN
    UPDATE public.orders SET status = 'COMPLETED', updated_at = now() WHERE id = _order_id;
  END IF;
  RETURN COALESCE(_ok,false);
END; $$;

CREATE OR REPLACE FUNCTION public.verify_reservation(_reservation_id uuid, _code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ok boolean;
BEGIN
  IF NOT public.is_team(auth.uid()) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT (verify_code = _code) INTO _ok FROM public.reservations WHERE id = _reservation_id;
  IF COALESCE(_ok,false) THEN
    UPDATE public.reservations SET status = 'SEATED', updated_at = now() WHERE id = _reservation_id;
  END IF;
  RETURN COALESCE(_ok,false);
END; $$;

-- reservation codes
CREATE OR REPLACE FUNCTION public.set_reservation_codes()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.reservation_code IS NULL OR NEW.reservation_code = '' THEN
    NEW.reservation_code := 'RS' || lpad((floor(random()*9000)+1000)::int::text,4,'0');
  END IF;
  IF NEW.verify_code IS NULL OR NEW.verify_code = '' THEN
    NEW.verify_code := lpad((floor(random()*90000)+10000)::int::text,5,'0');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER reservations_codes BEFORE INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.set_reservation_codes();

GRANT EXECUTE ON FUNCTION public.place_order(jsonb,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pay_order(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_pickup(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_reservation(uuid,text) TO authenticated;

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
