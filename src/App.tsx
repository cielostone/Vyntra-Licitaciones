import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { VyntraProvider } from "@/context/VyntraContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";
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
              {/* Ruta pública */}
              <Route path="/login" element={<Login />} />

              {/* Rutas protegidas — redirigen a /login si no hay sesión */}
              <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
              <Route path="/oportunidades" element={<PrivateRoute><Layout><Oportunidades /></Layout></PrivateRoute>} />
              <Route path="/postulaciones" element={<PrivateRoute><Layout><Postulaciones /></Layout></PrivateRoute>} />
              <Route path="/postular/:id" element={<PrivateRoute><Layout><NuevaPostulacion /></Layout></PrivateRoute>} />
              <Route path="/suscripcion" element={<PrivateRoute><Layout><Suscripcion /></Layout></PrivateRoute>} />
              <Route path="/configuracion" element={<PrivateRoute><Layout><Configuracion /></Layout></PrivateRoute>} />
              <Route path="*" element={<PrivateRoute><Layout><NotFound /></Layout></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </VyntraProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
