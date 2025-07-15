--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-15 12:10:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 24649)
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    mobile character varying(15) NOT NULL,
    address character varying(200),
    email character varying(100)
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24648)
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_id_seq OWNER TO postgres;

--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 219
-- Name: customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_id_seq OWNED BY public.customer.id;


--
-- TOC entry 224 (class 1259 OID 24665)
-- Name: item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    category_id integer,
    price double precision NOT NULL,
    is_weight_based boolean DEFAULT false
);


ALTER TABLE public.item OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24658)
-- Name: item_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_category (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.item_category OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24657)
-- Name: item_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_category_id_seq OWNER TO postgres;

--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 221
-- Name: item_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_category_id_seq OWNED BY public.item_category.id;


--
-- TOC entry 223 (class 1259 OID 24664)
-- Name: item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_id_seq OWNER TO postgres;

--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 223
-- Name: item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_id_seq OWNED BY public.item.id;


--
-- TOC entry 226 (class 1259 OID 24678)
-- Name: order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."order" (
    id integer NOT NULL,
    customer_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'pending'::character varying
);


ALTER TABLE public."order" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24677)
-- Name: order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_id_seq OWNER TO postgres;

--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 225
-- Name: order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_id_seq OWNED BY public."order".id;


--
-- TOC entry 228 (class 1259 OID 24692)
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    id integer NOT NULL,
    order_id integer,
    item_id integer,
    quantity integer,
    weight double precision,
    price double precision
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24691)
-- Name: order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_item_id_seq OWNER TO postgres;

--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 227
-- Name: order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_item_id_seq OWNED BY public.order_item.id;


--
-- TOC entry 218 (class 1259 OID 24640)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    username character varying(80) NOT NULL,
    password character varying(200) NOT NULL,
    role character varying(20) NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24639)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 217
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- TOC entry 4721 (class 2604 OID 24652)
-- Name: customer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer ALTER COLUMN id SET DEFAULT nextval('public.customer_id_seq'::regclass);


--
-- TOC entry 4723 (class 2604 OID 24668)
-- Name: item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item ALTER COLUMN id SET DEFAULT nextval('public.item_id_seq'::regclass);


--
-- TOC entry 4722 (class 2604 OID 24661)
-- Name: item_category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_category ALTER COLUMN id SET DEFAULT nextval('public.item_category_id_seq'::regclass);


--
-- TOC entry 4725 (class 2604 OID 24681)
-- Name: order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order" ALTER COLUMN id SET DEFAULT nextval('public.order_id_seq'::regclass);


--
-- TOC entry 4728 (class 2604 OID 24695)
-- Name: order_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item ALTER COLUMN id SET DEFAULT nextval('public.order_item_id_seq'::regclass);


--
-- TOC entry 4720 (class 2604 OID 24643)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 4897 (class 0 OID 24649)
-- Dependencies: 220
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer (id, name, mobile, address, email) FROM stdin;
1	ozama	769042761	237 Hill street, Dehiwala	ozama1513@gmail.com
2	jalal	761234567	123 Main Street, Colombo	jalal@gmail.com
3	john	758516681	15 galle road, wellawatte	john@gmail.com
4	jake	0779664561		
\.


--
-- TOC entry 4901 (class 0 OID 24665)
-- Dependencies: 224
-- Data for Name: item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item (id, name, category_id, price, is_weight_based) FROM stdin;
6	Wash and Dry Service	1	300	t
7	Bedsheet	5	400	f
8	Big blanket	5	800	f
9	Pillow case	5	200	f
10	Pillow	5	700	f
11	L Towel	5	250	f
12	M Towel	5	200	f
13	Duvet cover (Bed cover)	5	500	f
14	Quilt sheet (Comforter)	5	1200	f
15	Bath mats	5	300	f
16	Curtains (KG)	6	750	t
17	Carpets small	6	400	f
18	Carpets (BIG CARPETS)	6	1500	f
19	Sofa cover L	6	1200	f
20	Sofa cover S	6	1000	f
21	Cushion cover	6	300	f
22	Blazer	2	1000	f
23	2 piece suits	2	1200	f
24	3 piece W waistcoat	2	1600	f
25	Bridal dress	2	2500	f
26	Saree	2	700	f
27	Saree blouse	2	200	f
28	Wedding saree	2	900	f
29	Salwar	2	500	f
30	Shirt	2	450	f
31	T shirt	2	350	f
32	Thobe	2	500	f
33	Abaya	2	800	f
34	Kurtha Top	2	300	f
35	Beaded kurtha	2	500	f
36	Trouser	2	350	f
37	Jeans	2	350	f
38	Blouse	2	300	f
39	Frock	2	400	f
40	Overcoat	2	600	f
41	Shawl	2	200	f
42	Skirt	2	250	f
43	School unifom girls frock	2	400	f
44	School uniform shirt	2	250	f
45	School uniform skirt	2	300	f
46	School uniform trouser	2	250	f
47	School uniform short	2	150	f
48	School uniform 2 piece boys	2	500	f
49	Childrens frock	2	300	f
50	Party frock children	2	400	f
51	Shirt	3	350	f
52	Trouser	3	300	f
53	Jeans	3	300	f
54	Shorts	3	240	f
55	Kurtha Top	3	300	f
56	Thobe	3	450	f
57	Abaya	3	400	f
58	Blouse	3	300	f
59	Shalwar	3	400	f
60	Saree	3	600	f
61	School Uniform girls (frock)	3	450	f
62	School Uniform boys 2 piece	3	450	f
63	School uniform trouser	3	250	f
64	School uniform shirt	3	250	f
65	Shirt	4	200	f
66	T shirt	4	200	f
67	Kurtha Top	4	200	f
68	Thobe	4	250	f
69	Abaya	4	250	f
70	Trouser/ jeans	4	200	f
71	Blouse	4	180	f
72	Shorts	4	100	f
73	Frock	4	200	f
74	Skirt	4	200	f
75	Saree	4	300	f
76	School uniform girls	4	300	f
77	School uniform boys (2 piece)	4	400	f
\.


--
-- TOC entry 4899 (class 0 OID 24658)
-- Dependencies: 222
-- Data for Name: item_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_category (id, name) FROM stdin;
1	Wash and Dry
2	Dry Cleaning
3	Wash and Iron
4	Pressing Only
5	Bed and Bath Linen
6	Household Items
\.


--
-- TOC entry 4903 (class 0 OID 24678)
-- Dependencies: 226
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."order" (id, customer_id, created_at, status) FROM stdin;
2	1	2025-07-10 08:01:41.267827	delivered
3	2	2025-07-10 08:12:13.050916	delivered
1	1	2025-07-10 07:18:08.01935	delivered
5	1	2025-07-10 10:29:50.426306	delivered
4	2	2025-07-10 09:45:00.6869	delivered
6	2	2025-07-10 10:37:26.898882	delivered
7	2	2025-07-10 10:37:54.405195	delivered
8	2	2025-07-10 10:43:30.514506	delivered
9	2	2025-07-10 10:47:28.890554	delivered
10	1	2025-07-10 11:05:33.237077	delivered
11	3	2025-07-15 05:43:23.356091	delivered
\.


--
-- TOC entry 4905 (class 0 OID 24692)
-- Dependencies: 228
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_item (id, order_id, item_id, quantity, weight, price) FROM stdin;
1	1	6	\N	2	500
2	1	17	3	\N	1200
3	2	23	2	\N	2400
4	3	9	3	\N	600
5	4	6	\N	4	900
6	4	73	5	\N	1000
7	5	16	\N	63	13150
8	6	6	\N	12	2500
9	7	7	5	\N	2000
10	8	52	1	\N	300
11	9	9	4	\N	800
12	9	68	4	\N	1000
13	9	6	\N	5	1100
14	10	22	1	\N	1000
15	10	30	2	\N	900
16	10	6	\N	3	700
17	11	51	2	\N	700
\.


--
-- TOC entry 4895 (class 0 OID 24640)
-- Dependencies: 218
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, username, password, role) FROM stdin;
1	admin1	scrypt:32768:8:1$rpsek6Tz67PDlLBt$6f5e99b93cbf54755bd1d2e15cbe2bafbf247c02ff77e706db2b7c3720fddd50210ca04bd09ab7acdb49133a32f67fdca443591cd5103d4445bd8666f2c6f8d4	admin
2	cashier1	scrypt:32768:8:1$aOIzauEcitJZoga3$20dd66ea70b2494711e0dbf3c80b33cb155803a7b5e961213a5100f2d45135edd8d246a6465a7bb79671a0dc752618250d4a32d407442ae6b46bbe26eb4a569c	cahier
\.


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 219
-- Name: customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_id_seq', 4, true);


--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 221
-- Name: item_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_category_id_seq', 6, true);


--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 223
-- Name: item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_id_seq', 77, true);


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 225
-- Name: order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_id_seq', 11, true);


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 227
-- Name: order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_item_id_seq', 17, true);


--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 217
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 2, true);


--
-- TOC entry 4734 (class 2606 OID 24656)
-- Name: customer customer_mobile_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_mobile_key UNIQUE (mobile);


--
-- TOC entry 4736 (class 2606 OID 24654)
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- TOC entry 4738 (class 2606 OID 24663)
-- Name: item_category item_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_category
    ADD CONSTRAINT item_category_pkey PRIMARY KEY (id);


--
-- TOC entry 4740 (class 2606 OID 24671)
-- Name: item item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (id);


--
-- TOC entry 4744 (class 2606 OID 24697)
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4742 (class 2606 OID 24685)
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);


--
-- TOC entry 4730 (class 2606 OID 24645)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4732 (class 2606 OID 24647)
-- Name: user user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_username_key UNIQUE (username);


--
-- TOC entry 4745 (class 2606 OID 24672)
-- Name: item item_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item
    ADD CONSTRAINT item_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.item_category(id);


--
-- TOC entry 4746 (class 2606 OID 24686)
-- Name: order order_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."order"
    ADD CONSTRAINT order_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(id);


--
-- TOC entry 4747 (class 2606 OID 24703)
-- Name: order_item order_item_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item(id);


--
-- TOC entry 4748 (class 2606 OID 24698)
-- Name: order_item order_item_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_order_id_fkey FOREIGN KEY (order_id) REFERENCES public."order"(id) ON DELETE CASCADE;


-- Completed on 2025-07-15 12:10:43

--
-- PostgreSQL database dump complete
--

