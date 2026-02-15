import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { VyntraProvider } from "@/context/VyntraContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Oportunidades from "./pages/Oportunidades";
import Postulaciones from "./pages/Postulaciones";
import Configuracion from "./pages/Configuracion";
import NotFound from "./pages/NotFound";
import NuevaPostulacion from "./pages/NuevaPostulacion";
import Suscripcion from "./pages/Suscripcion";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <VyntraProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes - Wrapping in Layout */}
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/oportunidades" element={<Layout><Oportunidades /></Layout>} />
              <Route path="/postulaciones" element={<Layout><Postulaciones /></Layout>} />
              <Route path="/postular/:id" element={<Layout><NuevaPostulacion /></Layout>} />
              <Route path="/suscripcion" element={<Layout><Suscripcion /></Layout>} />
              <Route path="/configuracion" element={<Layout><Configuracion /></Layout>} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </VyntraProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
