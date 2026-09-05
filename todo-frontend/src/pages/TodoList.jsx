import { useEffect, useState } from "react";
import api from "../api";

export default function TodoList({ onLogout }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadTodos = async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (error) {
      console.error("Failed to load todos:", error);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsLoading(true);
    try {
      await api.post("/todos", { title, description: "", completed: false });
      setTitle("");
      await loadTodos();
    } catch (error) {
      console.error("Failed to add todo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComplete = async (todo) => {
    setTogglingId(todo.id);
    try {
      await api.put(`/todos/${todo.id}`, { ...todo, completed: !todo.completed });
      await loadTodos();
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    } finally {
      setTogglingId(null);
    }
  };

  const removeTodo = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/todos/${id}`);
      await loadTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 pt-16">
      <div className="w-full max-w-lg">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">My Todos</h2>
                <p className="text-white/60 text-sm">
                  {completedCount} of {totalCount} completed
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/30"
            >
              Logout
            </button>
          </div>

          {/* Add Todo Form */}
          <form onSubmit={addTodo} className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <input
                placeholder="Add a new todo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="bg-white text-indigo-600 px-5 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                "Add"
              )}
            </button>
          </form>

          {/* Todo List */}
          <ul className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`group flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 transition-all duration-200 hover:bg-white/20 hover:border-white/30 ${
                  todo.completed ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleComplete(todo)}
                    disabled={togglingId === todo.id}
                    className={`flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      todo.completed
                        ? "bg-emerald-400 border-emerald-400"
                        : "border-white/40 hover:border-white/70"
                    }`}
                  >
                    {todo.completed ? (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : togglingId === todo.id ? (
                      <svg className="animate-spin w-3 h-3 text-white/60" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : null}
                  </button>
                  <span
                    className={`flex-1 text-white transition-all duration-200 ${
                      todo.completed
                        ? "line-through text-white/50"
                        : "text-white"
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => removeTodo(todo.id)}
                  disabled={deletingId === todo.id}
                  className="flex-shrink-0 ml-3 text-white/40 hover:text-red-400 transition-colors duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-100"
                >
                  {deletingId === todo.id ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {todos.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-white/50 text-sm">
                No todos yet — add one above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}