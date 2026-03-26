import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock, Plus, Calendar, Loader2, Image as ImageIcon, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  description: string | null;
  image_url: string | null;
}

export default function Agenda() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [adding, setAdding] = useState(false);

  // Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setTasks(data as Task[]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;
    setAdding(true);

    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: newTaskTitle.trim(),
      status: 'todo',
    }).select().single();

    setAdding(false);

    if (error) {
      toast.error("Hubo un error al crear la tarea. Revisa tu esquema SQL.");
    } else if (data) {
      setTasks([data as Task, ...tasks]);
      setNewTaskTitle("");
    }
  };

  const toggleTaskStatus = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening modal
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
    if (error) {
       setTasks(tasks); // rollback
       toast.error("Error al actualizar la tarea");
    }
  };

  const handleUpdateSelectedTask = async () => {
    if (!selectedTask) return;
    setSavingTask(true);
    const { error } = await supabase.from('tasks').update({
      title: selectedTask.title,
      description: selectedTask.description,
      image_url: selectedTask.image_url,
      due_date: selectedTask.due_date,
      status: selectedTask.status
    }).eq('id', selectedTask.id);

    setSavingTask(false);

    if (error) {
       toast.error("Hubo un error al actualizar los detalles. ¿Ejecutaste el script SQL fase 4?");
    } else {
       toast.success("Tarea guardada exitosamente");
       setTasks(tasks.map(t => t.id === selectedTask.id ? selectedTask : t));
       setModalOpen(false);
    }
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask({ ...task });
    setModalOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setSavingTask(true);
    const { error } = await supabase.from('tasks').delete().eq('id', selectedTask.id);
    setSavingTask(false);
    if (!error) {
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setModalOpen(false);
      toast.success("Tarea eliminada");
    } else {
      toast.error("Fallo al eliminar");
    }
  };

  const pending = tasks.filter(t => t.status !== 'done');
  const completed = tasks.filter(t => t.status === 'done');

  // Convert exact ISO back to local datetime-local format string
  const toLocalISOString = (isoString: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const handleDateChange = (localValidStr: string) => {
    if (!selectedTask) return;
    if (!localValidStr) {
      setSelectedTask({ ...selectedTask, due_date: null });
      return;
    }
    const isoConvert = new Date(localValidStr).toISOString();
    setSelectedTask({ ...selectedTask, due_date: isoConvert });
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-10 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
      
      {/* Header Premium */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest backdrop-blur-md mb-2">
          Productividad B2B
        </div>
        <h1 className="text-3xl font-extrabold text-foreground md:text-5xl tracking-tight">
          Gestor <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Avanzado</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
          Supervisa tus hitos comerciales, adjunta evidencia y planifica al detalle.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        
        {/* Kanban Column 1: Pendientes */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={addTask} className="relative group">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-2xl blur-xl transition-all group-hover:blur-2xl opacity-50"></div>
             <Card className="relative border-border/50 bg-card/80 backdrop-blur-xl shadow-xl overflow-hidden rounded-2xl">
                <div className="flex items-center p-2 px-4 gap-3">
                  <Plus className="h-5 w-5 text-indigo-500" />
                  <Input 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Crear un nuevo hito comercial... (Ej: Cotizar Bases)"
                    className="bg-transparent border-none focus-visible:ring-0 text-lg md:text-xl shadow-none px-0"
                    disabled={adding}
                  />
                  <Button type="submit" disabled={adding || !newTaskTitle.trim()} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold">
                    Crear
                  </Button>
                </div>
             </Card>
          </form>

          <div className="space-y-3">
             <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
               <Clock className="w-5 h-5 text-amber-500" />
               Hitos Activos ({pending.length})
             </h3>
             {loading ? (
               <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
             ) : pending.length === 0 ? (
               <div className="border border-dashed border-border/60 rounded-2xl p-12 flex flex-col items-center justify-center text-muted-foreground bg-card/30">
                 <Calendar className="h-10 w-10 text-muted-foreground/50 mb-4" />
                 <p className="font-medium">No hay hitos pendientes.</p>
                 <p className="text-sm mt-1 text-center">Todo tu pipeline comercial está limpio y facturado.</p>
               </div>
             ) : (
               <div className="grid gap-3">
                 {pending.map(task => (
                   <Card 
                     key={task.id} 
                     className="group flex flex-col cursor-pointer transition-all hover:border-indigo-500/40 hover:shadow-lg bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden"
                     onClick={() => openTaskModal(task)}
                   >
                     <div className="p-4 flex items-start gap-4">
                       <button onClick={(e) => toggleTaskStatus(task, e)} className="text-muted-foreground hover:text-emerald-500 transition-colors shrink-0 mt-0.5">
                         <Circle className="h-6 w-6 stroke-[1.5]" />
                       </button>
                       <div className="flex-1 min-w-0">
                         <h4 className="font-semibold text-lg text-foreground truncate">{task.title}</h4>
                         {(task.due_date || task.description || task.image_url) && (
                           <div className="flex flex-wrap gap-4 mt-2">
                             {task.due_date && (
                               <Badge variant="outline" className="bg-rose-500/5 text-rose-600 border-rose-500/20 font-medium">
                                 <Calendar className="h-3 w-3 mr-1.5" />
                                 {new Date(task.due_date).toLocaleString()}
                               </Badge>
                             )}
                             {task.description && (
                               <div className="flex items-center text-xs font-medium text-muted-foreground">
                                 <FileText className="h-3 w-3 mr-1.5" /> Notas
                               </div>
                             )}
                             {task.image_url && (
                               <div className="flex items-center text-xs font-medium text-indigo-500">
                                 <ImageIcon className="h-3 w-3 mr-1.5" /> Evidencia Adjunta
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   </Card>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Kanban Column 2: Completadas / Historial */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Archivo Histórico ({completed.length})
          </h3>
          <div className="bg-card/40 border border-border/50 rounded-3xl p-4 min-h-[500px]">
            {completed.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-70 mt-20">
                 <CheckCircle2 className="h-10 w-10 mb-4 opacity-20" />
                 <p className="text-sm font-medium">Aún no hay archivo.</p>
               </div>
            ) : (
               <div className="space-y-3">
                 {completed.map(task => (
                   <div key={task.id} className="group flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-white/5 opacity-70 hover:opacity-100 transition-opacity">
                     <button onClick={(e) => toggleTaskStatus(task, e)} className="text-emerald-500 shrink-0">
                       <CheckCircle2 className="h-5 w-5" />
                     </button>
                     <div className="flex-1 min-w-0">
                       <span className="text-sm text-foreground line-through truncate block">{task.title}</span>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

      </div>

      {/* Tarea Expandida Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-border/60 shadow-2xl rounded-3xl p-0 overflow-hidden">
          {selectedTask && (
            <>
              <DialogHeader className="p-6 pb-2 border-b border-border/50 bg-muted/20">
                <div className="flex items-center gap-3 pr-8">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                     <FileText className="h-5 w-5" />
                  </div>
                  <Input 
                    value={selectedTask.title} 
                    onChange={e => setSelectedTask({...selectedTask, title: e.target.value})}
                    className="font-bold text-xl h-auto py-1 px-2 border-transparent hover:border-border bg-transparent focus-visible:bg-background/80"
                  />
                </div>
              </DialogHeader>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Estado</label>
                    <select 
                      value={selectedTask.status} 
                      onChange={e => setSelectedTask({...selectedTask, status: e.target.value as 'todo'|'in_progress'|'done'})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="todo">Pendiente</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="done">Terminado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha y Hora Límite</label>
                    <Input 
                      type="datetime-local" 
                      value={toLocalISOString(selectedTask.due_date)}
                      onChange={e => handleDateChange(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Descripción y Notas
                  </label>
                  <Textarea 
                    value={selectedTask.description || ""}
                    onChange={e => setSelectedTask({...selectedTask, description: e.target.value})}
                    placeholder="Agrega el contexto de este hito..."
                    className="min-h-[120px] bg-background resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> Fotografía Adjunta (URL)
                  </label>
                  <Input 
                    value={selectedTask.image_url || ""}
                    onChange={e => setSelectedTask({...selectedTask, image_url: e.target.value})}
                    placeholder="https://.../pantallazo.png"
                    className="bg-background"
                  />
                  {selectedTask.image_url && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-border/50 shadow-md">
                      <img src={selectedTask.image_url} alt="Evidencia" className="w-full h-auto object-cover max-h-[300px]" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                    </div>
                  )}
                </div>

              </div>

              <div className="p-4 border-t border-border/50 bg-muted/10 flex items-center justify-between">
                <Button variant="ghost" onClick={handleDeleteTask} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                   Eliminar Tarea
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                  <Button onClick={handleUpdateSelectedTask} disabled={savingTask} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                    {savingTask ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Guardar Ficha
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
