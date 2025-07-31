'use client';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import AuthForm from '../components/AuthForm';
import Dashboard from '../components/Dashboard';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';
import TicketModal from '../components/TicketModal';
import UserManagement from '../components/UserManagement';

export default function Home() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const auth = getAuth();
  const db = getDatabase();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        onValue(ref(db, 'users/' + u.uid), (snap) => setRole(snap.val()?.role || 'user'));
        onValue(ref(db, 'users'), (snap) => {
          const userList = [];
          const techList = [];
          snap.forEach(child => {
            const data = child.val();
            userList.push({ uid: child.key, ...data });
            if (data.role === 'technician' || data.role === 'admin') techList.push({ uid: child.key, email: data.email });
          });
          setUsers(userList);
          setTechnicians(techList);
        });
        onValue(ref(db, 'tickets'), (snap) => {
          const ticketList = [];
          snap.forEach(child => ticketList.push({ id: child.key, ...child.val() }));
          setTickets(ticketList.sort((a, b) => b.createdAt - a.createdAt)));
        });
        onValue(ref(db, 'notifications/' + u.uid), (snap) => {
          const notifList = [];
          snap.forEach(child => notifList.push(child.val()));
          setNotifications(notifList);
        });
      }
    });
    return unsubscribe;
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || t.status === filterStatus;
    const matchesPriority = !filterPriority || t.priority === filterPriority;
    const matchesCategory = !filterCategory || t.category === filterCategory;
    if (role === 'user') return matchesSearch && matchesStatus && matchesPriority && matchesCategory && t.creator === user?.uid;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const stats = `Open Tickets: ${tickets.filter(t => t.status === 'Open').length} | Assigned to Me: ${tickets.filter(t => t.assignee === user?.uid).length} | Total: ${tickets.length}`;

  if (darkMode) document.body.classList.add('dark');
  else document.body.classList.remove('dark');

  return (
    <div className="container">
      <h1>Grok's Full Org Ticketing System (Next.js App Router)</h1>
      <button onClick={() => setDarkMode(!darkMode)} style={{ background: '#6c757d', float: 'right' }}>Toggle Dark Mode</button>
      {!user ? (
        <AuthForm onLogin={() => {}} />
      ) : (
        <>
          <button onClick={() => auth.signOut()} style={{ background: '#6c757d' }}>Log Out</button>
          <p>Logged in as {user.email} ({role})</p>
          <Dashboard stats={stats} notifications={notifications} onViewNotifications={() => {
            const list = document.getElementById('notification-list');
            list.style.display = list.style.display === 'block' ? 'none' : 'block';
          }} />
          <div id="searchFilters">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option><option>Low</option><option>Medium</option><option>High</option>
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option><option>Hardware</option><option>Software</option><option>Billing</option><option>Other</option>
            </select>
            <button onClick={() => {}}>Apply</button> {/* Triggers re-render via state */}
          </div>
          {role === 'user' && <TicketForm userId={user.uid} />}
          <TicketList tickets={filteredTickets} role={role} onOpenModal={setSelectedTicket} />
          {role === 'admin' && <UserManagement users={users} />}
          {selectedTicket && (
            <TicketModal 
              ticket={selectedTicket} 
              role={role} 
              technicians={technicians} 
              users={users} 
              onClose={() => setSelectedTicket(null)} 
              currentUser={user} 
            />
          )}
        </>
      )}
    </div>
  );
}