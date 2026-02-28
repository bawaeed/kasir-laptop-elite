--
-- PostgreSQL database dump
--

\restrict ogYIaidNn6ynv99XJ30kQHEm6pltWWIYOj7nrZkzEkW3JdYqqBscDQvmicTOW23

-- Dumped from database version 18.2 (Debian 18.2-1.pgdg13+1)
-- Dumped by pg_dump version 18.2 (Debian 18.2-1.pgdg13+1)

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
-- Name: Customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Customer" (
    id integer NOT NULL,
    name text NOT NULL,
    whatsapp_number text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Customer" OWNER TO postgres;

--
-- Name: Customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Customer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Customer_id_seq" OWNER TO postgres;

--
-- Name: Customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Customer_id_seq" OWNED BY public."Customer".id;


--
-- Name: Laptop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Laptop" (
    id integer NOT NULL,
    sku_code text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    specs text,
    condition_notes text,
    cost_price double precision NOT NULL,
    target_price double precision NOT NULL,
    status text DEFAULT 'Tersedia'::text NOT NULL,
    entry_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    repair_cost double precision DEFAULT 0,
    image_url text
);


ALTER TABLE public."Laptop" OWNER TO postgres;

--
-- Name: Laptop_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Laptop_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Laptop_id_seq" OWNER TO postgres;

--
-- Name: Laptop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Laptop_id_seq" OWNED BY public."Laptop".id;


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id integer NOT NULL,
    invoice_number text NOT NULL,
    deal_price double precision NOT NULL,
    sale_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    laptop_id integer NOT NULL,
    customer_id integer NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: Transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Transaction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Transaction_id_seq" OWNER TO postgres;

--
-- Name: Transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Transaction_id_seq" OWNED BY public."Transaction".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: laptop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.laptop (
    id integer NOT NULL,
    sku_code character varying(100) NOT NULL,
    brand character varying(100) NOT NULL,
    model character varying(255) NOT NULL
);


ALTER TABLE public.laptop OWNER TO postgres;

--
-- Name: laptop_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.laptop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.laptop_id_seq OWNER TO postgres;

--
-- Name: laptop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.laptop_id_seq OWNED BY public.laptop.id;


--
-- Name: Customer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer" ALTER COLUMN id SET DEFAULT nextval('public."Customer_id_seq"'::regclass);


--
-- Name: Laptop id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Laptop" ALTER COLUMN id SET DEFAULT nextval('public."Laptop_id_seq"'::regclass);


--
-- Name: Transaction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction" ALTER COLUMN id SET DEFAULT nextval('public."Transaction_id_seq"'::regclass);


--
-- Name: laptop id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laptop ALTER COLUMN id SET DEFAULT nextval('public.laptop_id_seq'::regclass);


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Customer" (id, name, whatsapp_number, created_at) FROM stdin;
\.


--
-- Data for Name: Laptop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Laptop" (id, sku_code, brand, model, specs, condition_notes, cost_price, target_price, status, entry_date, updated_at, repair_cost, image_url) FROM stdin;
15	ASUS-TUF-001	Asus	TUF F15	Intel Core i5 11th Gen | Nvidia RTX3050	Nominus, Unit Charger dan Tas	6000000	8500000	Tersedia	2026-02-26 03:28:30.049	2026-02-26 06:15:20.646	0	/uploads/1772086520640_images.jpg
16	ASUS-TUF-002	Asus	TUF F15	123	123	6000000	8200000	Terjual	2026-02-26 06:22:39.201	2026-02-26 06:33:30.143	0	\N
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, invoice_number, deal_price, sale_date, laptop_id, customer_id) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c210c2bb-cd12-4be1-8dfa-3aff74f55ff2	c8cde13142e9b13d8c32529cca85f2e1a5c81e532f6021c081e3542b781171fd	2026-02-23 08:27:48.974539+00	20260223082748_init	\N	\N	2026-02-23 08:27:48.942817+00	1
\.


--
-- Data for Name: laptop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.laptop (id, sku_code, brand, model) FROM stdin;
\.


--
-- Name: Customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Customer_id_seq"', 1, false);


--
-- Name: Laptop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Laptop_id_seq"', 16, true);


--
-- Name: Transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Transaction_id_seq"', 1, false);


--
-- Name: laptop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.laptop_id_seq', 1, false);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: Laptop Laptop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Laptop"
    ADD CONSTRAINT "Laptop_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: laptop laptop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laptop
    ADD CONSTRAINT laptop_pkey PRIMARY KEY (id);


--
-- Name: Laptop_sku_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Laptop_sku_code_key" ON public."Laptop" USING btree (sku_code);


--
-- Name: Transaction_invoice_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Transaction_invoice_number_key" ON public."Transaction" USING btree (invoice_number);


--
-- Name: Transaction Transaction_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_laptop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_laptop_id_fkey" FOREIGN KEY (laptop_id) REFERENCES public."Laptop"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict ogYIaidNn6ynv99XJ30kQHEm6pltWWIYOj7nrZkzEkW3JdYqqBscDQvmicTOW23

