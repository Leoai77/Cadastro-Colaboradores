import React, { useState, useEffect } from 'react';
import { auth, db, signIn, signOut, OperationType, handleFirestoreError } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Employee } from './types';
import { FileUpload } from './components/FileUpload';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeList } from './components/EmployeeList';
import { ConfirmModal } from './components/ConfirmModal';
import { LogIn, LogOut, Users, Plus, List, Loader2, User as UserIcon } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setEmployees([]);
      return;
    }

    const q = query(collection(db, 'employees'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(emps);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'employees');
    });

    return unsubscribe;
  }, [user]);

  const handleSave = async (data: Employee) => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (data.id) {
        const { id, ...rest } = data;
        await updateDoc(doc(db, 'employees', id), {
          ...rest,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'employees'), {
          ...data,
          uid: user.uid,
          createdAt: new Date().toISOString()
        });
      }
      setView('list');
      setEditingEmployee(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'employees');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'employees', deleteId));
      setDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'employees');
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro de Funcionários</h1>
          <p className="text-gray-500 mb-8">Faça login para gerenciar os cadastros da sua empresa.</p>
          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <LogIn className="w-6 h-6" />
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Cadastro de Funcionários</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" />
              ) : (
                <UserIcon className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700 hidden md:block">{user.displayName}</span>
            </div>
            <button
              onClick={signOut}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {view === 'list' ? 'Funcionários Cadastrados' : editingEmployee?.id ? 'Editar Funcionário' : 'Novo Cadastro'}
            </h2>
            <p className="text-gray-500">
              {view === 'list' ? `${employees.length} registros encontrados` : 'Preencha os dados abaixo ou use um PDF'}
            </p>
          </div>

          <button
            onClick={() => {
              if (view === 'list') {
                setEditingEmployee(null);
                setView('form');
              } else {
                setView('list');
              }
            }}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            {view === 'list' ? (
              <>
                <Plus className="w-5 h-5 text-primary" />
                Novo Funcionário
              </>
            ) : (
              <>
                <List className="w-5 h-5 text-primary" />
                Voltar para Lista
              </>
            )}
          </button>
        </div>

        {view === 'list' ? (
          <EmployeeList
            employees={employees}
            onEdit={(emp) => {
              setEditingEmployee(emp);
              setView('form');
            }}
            onDelete={handleDelete}
          />
        ) : (
          <div className="space-y-8">
            {!editingEmployee?.id && (
              <FileUpload 
                onDataExtracted={(data) => {
                  setEditingEmployee(prev => {
                    const merged = { ...(prev || {}) };
                    Object.entries(data).forEach(([key, value]) => {
                      // Only merge if the new value is not empty
                      const isEmpty = value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
                      if (!isEmpty) {
                        (merged as any)[key] = value;
                      }
                    });
                    return merged;
                  });
                }} 
              />
            )}
            <EmployeeForm
              initialData={editingEmployee || {}}
              onSave={handleSave}
              isSaving={isSaving}
            />
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Funcionário"
        message="Tem certeza que deseja excluir este cadastro? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}
