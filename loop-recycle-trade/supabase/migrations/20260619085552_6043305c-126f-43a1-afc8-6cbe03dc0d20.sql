
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('industry', 'collector', 'recycler', 'retailer', 'admin');
CREATE TYPE public.waste_category AS ENUM ('plastic','metal','paper','glass','textile','rubber','ewaste','organic','chemical','other');
CREATE TYPE public.listing_status AS ENUM ('draft','active','assigned','collected','cancelled');
CREATE TYPE public.pickup_status AS ENUM ('requested','approved','rejected','scheduled','in_transit','completed','cancelled');
CREATE TYPE public.order_status AS ENUM ('pending','processing','shipped','delivered','cancelled','refunded');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE public.verification_status AS ENUM ('unverified','pending','verified','rejected');

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  active_role public.app_role,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Self-service role assignment (any user can claim any non-admin role for themselves during onboarding)
CREATE POLICY "roles_insert_own_nonadmin" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND role <> 'admin');

-- ============ INDUSTRY PROFILE ============
CREATE TABLE public.industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  gst_number TEXT,
  industry_type TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  verification public.verification_status NOT NULL DEFAULT 'unverified',
  sustainability_score NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.industries TO authenticated;
GRANT ALL ON public.industries TO service_role;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "industries_select_all_authed" ON public.industries FOR SELECT TO authenticated USING (true);
CREATE POLICY "industries_write_own" ON public.industries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "industries_update_own" ON public.industries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_industries_updated BEFORE UPDATE ON public.industries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ COLLECTORS ============
CREATE TABLE public.collectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  license_number TEXT,
  service_area TEXT,
  city TEXT,
  vehicle_details TEXT,
  specialties public.waste_category[],
  rating NUMERIC NOT NULL DEFAULT 0,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  verification public.verification_status NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.collectors TO authenticated;
GRANT ALL ON public.collectors TO service_role;
ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collectors_select_all_authed" ON public.collectors FOR SELECT TO authenticated USING (true);
CREATE POLICY "collectors_write_own" ON public.collectors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collectors_update_own" ON public.collectors FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_collectors_updated BEFORE UPDATE ON public.collectors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ RECYCLERS ============
CREATE TABLE public.recyclers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  certifications TEXT[],
  processing_capacity TEXT,
  city TEXT,
  verification public.verification_status NOT NULL DEFAULT 'unverified',
  rating NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.recyclers TO authenticated;
GRANT ALL ON public.recyclers TO service_role;
ALTER TABLE public.recyclers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recyclers_select_all_authed" ON public.recyclers FOR SELECT TO authenticated USING (true);
CREATE POLICY "recyclers_write_own" ON public.recyclers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recyclers_update_own" ON public.recyclers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_recyclers_updated BEFORE UPDATE ON public.recyclers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ RETAILERS ============
CREATE TABLE public.retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  gst_number TEXT,
  business_type TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.retailers TO authenticated;
GRANT ALL ON public.retailers TO service_role;
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "retailers_select_all_authed" ON public.retailers FOR SELECT TO authenticated USING (true);
CREATE POLICY "retailers_write_own" ON public.retailers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "retailers_update_own" ON public.retailers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_retailers_updated BEFORE UPDATE ON public.retailers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ WASTE LISTINGS ============
CREATE TABLE public.waste_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category public.waste_category NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  estimated_value NUMERIC,
  pickup_address TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[],
  available_from DATE,
  pickup_deadline DATE,
  status public.listing_status NOT NULL DEFAULT 'active',
  ai_classification JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waste_listings TO authenticated;
GRANT ALL ON public.waste_listings TO service_role;
ALTER TABLE public.waste_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waste_select_all_authed" ON public.waste_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "waste_insert_industry" ON public.waste_listings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = industry_user_id AND public.has_role(auth.uid(), 'industry'));
CREATE POLICY "waste_update_owner" ON public.waste_listings FOR UPDATE TO authenticated USING (auth.uid() = industry_user_id);
CREATE POLICY "waste_delete_owner" ON public.waste_listings FOR DELETE TO authenticated USING (auth.uid() = industry_user_id);
CREATE TRIGGER trg_waste_updated BEFORE UPDATE ON public.waste_listings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_waste_status ON public.waste_listings(status);
CREATE INDEX idx_waste_category ON public.waste_listings(category);

-- ============ PICKUP REQUESTS ============
CREATE TABLE public.pickup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.waste_listings(id) ON DELETE CASCADE,
  collector_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  offered_price NUMERIC,
  status public.pickup_status NOT NULL DEFAULT 'requested',
  scheduled_at TIMESTAMPTZ,
  proof_images TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(listing_id, collector_user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pickup_requests TO authenticated;
GRANT ALL ON public.pickup_requests TO service_role;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pickup_select_party" ON public.pickup_requests FOR SELECT TO authenticated
  USING (auth.uid() = collector_user_id OR auth.uid() = industry_user_id);
CREATE POLICY "pickup_insert_collector" ON public.pickup_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = collector_user_id AND public.has_role(auth.uid(), 'collector'));
CREATE POLICY "pickup_update_party" ON public.pickup_requests FOR UPDATE TO authenticated
  USING (auth.uid() = collector_user_id OR auth.uid() = industry_user_id);
CREATE TRIGGER trg_pickup_updated BEFORE UPDATE ON public.pickup_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ RECYCLER INVENTORY ============
CREATE TABLE public.recycler_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recycler_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_listing_id UUID REFERENCES public.waste_listings(id) ON DELETE SET NULL,
  category public.waste_category NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recycler_inventory TO authenticated;
GRANT ALL ON public.recycler_inventory TO service_role;
ALTER TABLE public.recycler_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv_select_own" ON public.recycler_inventory FOR SELECT TO authenticated USING (auth.uid() = recycler_user_id);
CREATE POLICY "inv_insert_own" ON public.recycler_inventory FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = recycler_user_id AND public.has_role(auth.uid(), 'recycler'));
CREATE POLICY "inv_update_own" ON public.recycler_inventory FOR UPDATE TO authenticated USING (auth.uid() = recycler_user_id);
CREATE POLICY "inv_delete_own" ON public.recycler_inventory FOR DELETE TO authenticated USING (auth.uid() = recycler_user_id);

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recycler_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category public.waste_category NOT NULL,
  description TEXT,
  images TEXT[],
  sku TEXT,
  available_quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  price NUMERIC NOT NULL,
  certifications TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_all_authed" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_insert_recycler" ON public.products FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = recycler_user_id AND public.has_role(auth.uid(), 'recycler'));
CREATE POLICY "products_update_owner" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = recycler_user_id);
CREATE POLICY "products_delete_owner" ON public.products FOR DELETE TO authenticated USING (auth.uid() = recycler_user_id);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CART ============
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_all_own" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = buyer_user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_user_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = buyer_user_id);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  recycler_user_id UUID NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oi_select_party" ON public.order_items FOR SELECT TO authenticated
  USING (
    auth.uid() = recycler_user_id OR
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_user_id = auth.uid())
  );
CREATE POLICY "oi_insert_buyer" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.buyer_user_id = auth.uid()));

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  provider TEXT,
  provider_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_select_own" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pay_insert_own" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all_authed" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_user_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============ CONVERSATIONS / MESSAGES ============
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_a, user_b)
);
GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_select_party" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() IN (user_a, user_b));
CREATE POLICY "conv_insert_party" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (user_a, user_b));

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msg_select_party" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() IN (c.user_a, c.user_b)));
CREATE POLICY "msg_insert_party" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_user_id AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND auth.uid() IN (c.user_a, c.user_b)));
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============ SUSTAINABILITY REPORTS ============
CREATE TABLE public.sustainability_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  waste_generated_kg NUMERIC NOT NULL DEFAULT 0,
  waste_recycled_kg NUMERIC NOT NULL DEFAULT 0,
  carbon_saved_kg NUMERIC NOT NULL DEFAULT 0,
  diverted_from_landfill_kg NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.sustainability_reports TO authenticated;
GRANT ALL ON public.sustainability_reports TO service_role;
ALTER TABLE public.sustainability_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sust_select_own" ON public.sustainability_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "sust_insert_own" ON public.sustainability_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sust_update_own" ON public.sustainability_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id);
