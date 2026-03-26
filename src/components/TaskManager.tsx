import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock, Plus, MoreHorizontal, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
}

export function TaskManager() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [adding, setAdding] = useState(false);

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
    
    // Asignar por defecto a MAÑANA
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: newTaskTitle.trim(),
      status: 'todo',
      due_date: tomorrow.toISOString(),
    }).select().single();

    setAdding(false);

    if (error) {
      toast.error("Hubo un error al crear la tarea.");
    } else if (data) {
      setTasks([data as Task, ...tasks]);
      setNewTaskTitle("");
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    // Si era todo/in_progress -> done. Si era done -> todo.
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    // Optistic update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
    if (error) {
       // Rollback on error
       setTasks(tasks);
       toast.error("Error al actualizar la tarea");
    }
  };

  // Grouping tasks
  const pending = tasks.filter(t => t.status !== 'done');
  const completed = tasks.filter(t => t.status === 'done').slice(0, 5); // Show only last 5 done

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-xl rounded-2xl h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Agenda & Hitos
            </CardTitle>
            <CardDescription className="mt-1">Gestiona anexos y entregas (Linear Mode)</CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 font-mono">
            {pending.length} Pendientes
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto p-0 flex flex-col">
        {/* Input Add Task */}
        <div className="p-4 border-b border-border/50 bg-background/30">
          <form onSubmit={addTask} className="relative">
             <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input 
               value={newTaskTitle}
               onChange={(e) => setNewTaskTitle(e.target.value)}
               placeholder="Planificar acción... (Ej: Subir propuesta técnica)"
               className="pl-9 bg-background/80 border-border focus-visible:ring-indigo-500/30 rounded-xl h-10 shadow-sm"
               disabled={adding}
             />
          </form>
        </div>

        {/* Task List */}
        <div className="flex-1 p-2 space-y-1">
          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : tasks.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground px-4">
               <div className="h-12 w-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-3">
                 <Clock className="h-6 w-6 text-indigo-400" />
               </div>
               <p className="font-medium text-foreground">Día productivo libre</p>
               <p className="text-sm mt-1">Escribe tu primer hito arriba para comenzar a estructurar tu licitación.</p>
             </div>
          ) : (
            <>
              {pending.map(task => (
                <div key={task.id} className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                   <button onClick={() => toggleTaskStatus(task)} className="text-muted-foreground hover:text-indigo-500 transition-colors shrink-0">
                     <Circle className="h-5 w-5 stroke-[1.5]" />
                   </button>
                   <div className="flex-1 flex flex-col min-w-0">
                     <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
                     {task.due_date && (
                       <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                         <Calendar className="h-3 w-3" /> Mañana
                       </span>
                     )}
                   </div>
                   <button className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity">
                     <MoreHorizontal className="h-4 w-4" />
                   </button>
                </div>
              ))}

              {completed.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50 mx-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Completadas</p>
                  {completed.map(task => (
                    <div key={task.id} className="group flex items-center gap-3 p-2.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleTaskStatus(task)} className="text-emerald-500 shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <span className="text-sm text-foreground line-through truncate flex-1">{task.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
