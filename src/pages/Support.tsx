import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { toast } from 'sonner';
import { MessageSquare, Send, CheckCircle2, Search, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'LOW' });

  const isCustomer = user?.role === 'customer';

  const loadTickets = async () => {
    try {
      const res = await fetchWithAuth('/tickets');
      setTickets(res.data);
      if (selectedTicket) {
        const updated = res.data.find((t: any) => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (e) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/tickets', {
        method: 'POST',
        body: JSON.stringify({ ...newTicket, customerId: user?._id }),
      });
      toast.success('Ticket created');
      setIsModalOpen(false);
      setNewTicket({ subject: '', description: '', priority: 'LOW' });
      loadTickets();
    } catch (e) {
      toast.error('Failed to create ticket');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedTicket) return;
    
    try {
      // Just a simple put to update the ticket by adding a message.
      // We will fetch the current ticket, push message, then PUT.
      const updatedMessages = [...(selectedTicket.messages || []), {
        senderType: isCustomer ? 'customer' : 'staff',
        senderId: user?._id,
        message: message,
        createdAt: new Date().toISOString()
      }];
      
      const toUpdate = { messages: updatedMessages };
      // If a staff replies to OPEN, make it IN_PROGRESS
      if (!isCustomer && selectedTicket.status === 'OPEN') {
        (toUpdate as any).status = 'IN_PROGRESS';
      }

      await fetchWithAuth(`/tickets/${selectedTicket._id}`, {
        method: 'PUT',
        body: JSON.stringify(toUpdate),
      });
      setMessage('');
      loadTickets();
    } catch (e) {
      toast.error('Failed to send message');
    }
  };

  const resolveTicket = async (id: string) => {
    if(!confirm('Mark as resolved?')) return;
    try {
      await fetchWithAuth(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'RESOLVED' }) });
      toast.success('Ticket resolved');
      loadTickets();
    } catch (e) {
      toast.error('Operation failed');
    }
  }

  return (
    <div className="flex h-[calc(100vh-[var(--navbar-height)-2rem])] gap-6">
      {/* Sidebar List */}
      <div className="w-1/3 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-800">Support Tickets</h2>
          {isCustomer && (
            <button onClick={() => setIsModalOpen(true)} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors">
              <PlusCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No tickets found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map(ticket => (
                <div 
                  key={ticket._id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTicket?._id === ticket._id ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-slate-800 truncate pr-2">{ticket.subject}</h3>
                    <div className={`text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded ${
                      ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                      ticket.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {ticket.status}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-2">{ticket.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>{ticket.priority} Priority</span>
                    <span>{format(new Date(ticket.createdAt), 'MMM d, HH:mm')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900">{selectedTicket.subject}</h2>
                <p className="text-sm text-slate-500 mt-1">Ticket #{selectedTicket._id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                  <button onClick={() => resolveTicket(selectedTicket._id)} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 text-sm font-bold rounded-xl transition-colors">
                    <CheckCircle2 className="w-4 h-4" /> Resolve
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30">
              {/* Initial description as first message */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">C</div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 w-full shadow-sm">
                  <p className="text-sm text-slate-700">{selectedTicket.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">{format(new Date(selectedTicket.createdAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
              </div>

              {/* Replies */}
              {selectedTicket.messages?.map((msg: any, idx: number) => {
                const isCustomerMessage = msg.senderType === 'customer';
                return (
                  <div key={idx} className={`flex gap-4 ${isCustomerMessage ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isCustomerMessage ? 'bg-indigo-100 text-indigo-600' : 'bg-fuchsia-100 text-fuchsia-600'}`}>
                      {isCustomerMessage ? 'C' : 'S'}
                    </div>
                    <div className={`border rounded-2xl p-4 max-w-[80%] shadow-sm ${
                      isCustomerMessage ? 'bg-white border-slate-200 rounded-tl-none' : 'bg-fuchsia-600 border-fuchsia-700 text-white rounded-tr-none'
                    }`}>
                      <p className={`text-sm ${isCustomerMessage ? 'text-slate-700' : 'text-fuchsia-50'}`}>{msg.message}</p>
                      <p className={`text-[10px] mt-2 font-medium ${isCustomerMessage ? 'text-slate-400' : 'text-fuchsia-200'}`}>
                        {format(new Date(msg.createdAt), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 border-2 border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                  <button type="submit" disabled={!message.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p>Select a ticket to begin messaging</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
             <div className="flex justify-between items-center p-6 border-b border-gray-100">
               <h2 className="text-xl font-bold">New Ticket</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
             </div>
             <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                   <input required type="text" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-indigo-500" placeholder="e.g., Cannot access invoice" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                   <textarea required rows={4} value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-indigo-500 resize-none" placeholder="Provide details..."></textarea>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                   <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} className="w-full border p-3 rounded-xl text-sm outline-none focus:border-indigo-500">
                     <option value="LOW">Low</option>
                     <option value="MEDIUM">Medium</option>
                     <option value="HIGH">High</option>
                   </select>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">Create Ticket</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
