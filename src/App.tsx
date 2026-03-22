import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Combo } from "./pages/Combo";
import { Shop } from "./pages/Shop";
import { About } from "./pages/About";
import { FAQ } from "./pages/FAQ";
import { Shipping } from "./pages/Shipping";
import { Returns } from "./pages/Returns";
import { Contact } from "./pages/Contact";
import { Checkout } from "./pages/Checkout";
import { ProductPage } from "./pages/ProductPage";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import { ScrollToTop } from "./components/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="combo" element={<Combo />} />
          <Route path="shop" element={<Shop />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="returns" element={<Returns />} />
          <Route path="contact" element={<Contact />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout/success" element={<OrderConfirmation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
