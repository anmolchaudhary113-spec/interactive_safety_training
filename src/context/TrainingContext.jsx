import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialModules } from '../data/modulesData';
import { quizQuestions } from '../data/quizData';
import { sampleUsers, sampleAdmin, systemNotifications } from '../data/demoData';

function useSaved(key, fallback) {
  const [value, setValue] = useState(() => { try { const v = JSON.parse(localStorage.getItem('safelearn-v2-' + key)); return v ?? fallback; } catch { return fallback; } });
  useEffect(() => { try { localStorage.setItem('safelearn-v2-' + key, JSON.stringify(value)); } catch { /* Private mode / storage quota: retain the current session. */ } }, [key, value]);
  return [value, setValue];
}
const TrainingContext = createContext(null);

export function TrainingProvider({ children }) {
  // Current user session: null | Employee | Admin
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing');
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Curriculum State
  const [modules, setModules] = useSaved('modules', initialModules);
  useEffect(() => {
    setModules(prev => {
      if (!Array.isArray(prev)) return initialModules;
      const existingIds = new Set(prev.map(m => m.id));
      const missing = initialModules.filter(m => !existingIds.has(m.id));
      if (missing.length > 0) {
        return [...prev, ...missing];
      }
      return prev;
    });
  }, []);
  const [activeModuleId, setActiveModuleId] = useState('hse-202');
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  // Gamification & Progress State
  const [completedModules, setCompletedModules] = useSaved('completed', []);
  const [safetyPoints, setSafetyPoints] = useSaved('points', 0);
  const [certificates, setCertificates] = useSaved('certificates', []);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Activity 1: PPE State
  const [ppeSelections, setPpeSelections] = useState([]);
  const [ppeSubmitted, setPpeSubmitted] = useState(false);
  const [ppeFeedback, setPpeFeedback] = useState(null);

  // Activity 2: Hazard Spotting State
  const [foundHazards, setFoundHazards] = useSaved('hazards', []);
  const [activeHazardModal, setActiveHazardModal] = useState(null);

  // Activity 3: Scenario State
  const [selectedScenarioOption, setSelectedScenarioOption] = useState(null);
  const [scenarioSubmitted, setScenarioSubmitted] = useState(false);

  // Quiz Engine State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);

  // Admin Management State
  const [usersList, setUsersList] = useSaved('users', sampleUsers);
  const [adminQuestions, setAdminQuestions] = useSaved('questions-v3', quizQuestions);
  const [adminPassMark, setAdminPassMark] = useSaved('passmark', 70);
  const [notifications, setNotifications] = useSaved('notifications', systemNotifications);
  const [auditNotes, setAuditNotes] = useSaved('audit-notes', []);
  const [selectedAuditUser, setSelectedAuditUser] = useState(sampleUsers[0]);

  const [lessonProgress, setLessonProgress] = useSaved('lessons', {});
  const [practiceComplete, setPracticeComplete] = useSaved('practice', false);
  const [attempts, setAttempts] = useSaved('attempts', []);
  const [assignments, setAssignments] = useSaved('assignments', []);
  useEffect(() => {
    setUsersList(prev => prev.map(u => {
      const userAttempts = attempts.filter(a => a.employeeId && a.employeeId.toLowerCase() === u.id.toLowerCase());
      const uCompleted = u.id === sampleUsers[0].id ? completedModules : (u.completedModules || []);
      const avg = userAttempts.length ? Math.round(userAttempts.reduce((n, a) => n + a.score, 0) / userAttempts.length) : (u.avgScore || 0);
      const prog = Math.round((uCompleted.length / Math.max(1, modules.length)) * 100);
      const last = userAttempts[0]?.completedAt
        ? new Date(userAttempts[0].completedAt).toLocaleString()
        : (u.lastActive || 'No assessment yet');
      return {
        ...u,
        completedModules: uCompleted,
        progress: prog,
        avgScore: avg,
        lastActive: last
      };
    }));
  }, [completedModules, attempts, modules.length]);
  const [rewards, setRewards] = useSaved('rewards', []);
  const awardOnce = (id, points) => { if (!rewards.includes(id)) { setRewards(prev => [...new Set([...prev, id])]); setSafetyPoints(prev => prev + points); } };
  const finishPractice = () => { setPracticeComplete(true); awardOnce('manual-practice', 100); showToast('Guided practice complete. Assessment unlocked.', 'success'); };
  useEffect(() => {
    const onHash = () => { if (!currentUser) { const route = window.location.hash; setCurrentView(route === '#/about' ? 'about' : route === '#/tutorials' ? 'tutorials' : 'landing'); window.scrollTo(0,0); if (route === '#/topics' || route === '#/training') setTimeout(() => document.getElementById(route.slice(2))?.scrollIntoView(), 50); } };
    onHash(); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash);
  }, [currentUser]);
  useEffect(() => { window.scrollTo(0,0); }, [currentView]);
  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const sendReminder = (recipientId, customMessage) => {
    const targetUser = usersList.find(u => u.id.toLowerCase() === recipientId.toLowerCase());
    const name = targetUser?.name || recipientId;
    const item = {
      id: Date.now(),
      recipientId: recipientId,
      recipientName: name,
      title: `Training Refresher Directive: ${name}`,
      type: 'reminder',
      timestamp: 'Just now',
      date: new Date().toISOString(),
      content: customMessage || `Supervisor reminder for ${name}: Please complete your pending health and safety training modules promptly.`
    };
    setNotifications(prev => [item, ...prev]);
    showToast('Reminder sent successfully.', 'success');
    return item;
  };

  const logAuditNote = (userId, noteText) => {
    const targetUser = usersList.find(u => u.id.toLowerCase() === userId.toLowerCase());
    const newNote = {
      id: Date.now(),
      userId: userId,
      userName: targetUser?.name || userId,
      author: currentUser?.name || 'Marcus Vance (Supervisor)',
      note: noteText,
      createdAt: new Date().toISOString()
    };
    setAuditNotes(prev => [newNote, ...prev]);
    showToast('Audit note saved.', 'success');
    return newNote;
  };

  const updateUserPermissions = (userId, updatedData) => {
    setUsersList(prev => prev.map(u => {
      if (u.id.toLowerCase() === userId.toLowerCase()) {
        return { ...u, ...updatedData };
      }
      return u;
    }));
    if (selectedAuditUser?.id?.toLowerCase() === userId.toLowerCase()) {
      setSelectedAuditUser(prev => ({ ...prev, ...updatedData }));
    }
    showToast('Permissions updated successfully.', 'success');
  };

  const updateModuleContent = (moduleId, updatedContent) => {
    setModules(prev => prev.map(m => {
      if (m.id === moduleId) {
        return { ...m, ...updatedContent };
      }
      return m;
    }));
    showToast('Training content updated.', 'success');
  };

  // Login handler
  const loginAs = (roleOrUser = 'employee') => {
    if (roleOrUser === 'admin' || roleOrUser === 'ADM-101') {
      setCurrentUser(sampleAdmin);
      setCurrentView('dashboard');
      showToast('Logged in as Supervisor (Marcus Vance)', 'success');
    } else {
      let targetUser = sampleUsers[0];
      if (typeof roleOrUser === 'object' && roleOrUser?.id) {
        targetUser = usersList.find(u => u.id.toLowerCase() === roleOrUser.id.toLowerCase()) || roleOrUser;
      } else if (typeof roleOrUser === 'string' && roleOrUser !== 'employee') {
        const found = usersList.find(u => u.id.toLowerCase() === roleOrUser.trim().toLowerCase());
        if (found) {
          targetUser = found;
        } else {
          const sampleFound = sampleUsers.find(u => u.id.toLowerCase() === roleOrUser.trim().toLowerCase());
          if (sampleFound) targetUser = sampleFound;
        }
      }
      if (targetUser) {
        targetUser = { ...targetUser, role: 'employee' };
      }
      setCurrentUser(targetUser);
      setCurrentView('home');
      showToast(`Logged in as Employee (${targetUser.name})`, 'success');
    }
    setLoginModalOpen(false);
  };

  const logout = () => {
    window.location.hash = '#/';
    setCurrentUser(null);
    setCurrentView('landing');
    showToast('Logged out successfully', 'info');
  };

  // Start / Open a module
  const openModule = (moduleId) => {
    setActiveModuleId(moduleId);
    setActiveLessonIndex(Math.min(lessonProgress[moduleId] || 0, (modules.find(m => m.id === moduleId)?.lessons.length || 1) - 1));
    setCurrentView('lesson');
  };

  // Get completed modules for a specific user ID
  const getUserCompletedModules = (userId = currentUser?.id) => {
    if (!userId) return [];
    if (userId === sampleUsers[0].id) {
      return completedModules;
    }
    const user = usersList.find(u => u.id.toLowerCase() === userId.toLowerCase()) || (currentUser?.id?.toLowerCase() === userId.toLowerCase() ? currentUser : null);
    return user?.completedModules || [];
  };

  const activeCompletedModules = (!currentUser || currentUser.role === 'admin')
    ? completedModules
    : getUserCompletedModules(currentUser.id);

  // Check if a module is completed by a user
  const isModuleCompleted = (modId, userId = currentUser?.id) => {
    if (!modId) return false;
    const targetId = userId || currentUser?.id;
    return getUserCompletedModules(targetId).includes(modId);
  };

  // Complete lesson
  const completeActiveLesson = () => {
    const currentMod = modules.find(m => m.id === activeModuleId);
    if (!currentMod) return;
    if (currentUser?.role === 'admin') { if (activeLessonIndex < currentMod.lessons.length - 1) setActiveLessonIndex(activeLessonIndex + 1); else setCurrentView('modules-mgmt'); return; }

    const done = Math.max(lessonProgress[activeModuleId] || 0, activeLessonIndex + 1);
    setLessonProgress(prev => ({...prev, [activeModuleId]: done}));
    if (activeLessonIndex < currentMod.lessons.length - 1) setActiveLessonIndex(activeLessonIndex + 1);
    else if (activeModuleId === 'hse-303') setCurrentView('activity-hazard');
    else {
      if (currentUser?.id === sampleUsers[0].id) {
        setCompletedModules(prev => [...new Set([...prev, activeModuleId])]);
      }
      if (currentUser?.id) {
        setUsersList(prev => prev.map(u => {
          if (u.id.toLowerCase() === currentUser.id.toLowerCase()) {
            const updated = [...new Set([...(u.completedModules || []), activeModuleId])];
            return {
              ...u,
              completedModules: updated,
              progress: Math.round((updated.length / Math.max(1, modules.length)) * 100),
              lastActive: 'Just now'
            };
          }
          return u;
        }));
        setCurrentUser(prev => prev ? {
          ...prev,
          completedModules: [...new Set([...(prev.completedModules || []), activeModuleId])]
        } : prev);
      }
      awardOnce(activeModuleId, 150);
      setCurrentView('modules');
    }
  };

  // Interactive PPE Challenge
  const togglePpeItem = (itemId) => {
    if (ppeSubmitted) return;
    if (ppeSelections.includes(itemId)) {
      setPpeSelections(ppeSelections.filter(id => id !== itemId));
    } else {
      setPpeSelections([...ppeSelections, itemId]);
    }
  };

  const submitPpeActivity = () => {
    const required = ['helmet', 'vest', 'boots', 'gloves'];
    const correctCount = ppeSelections.filter(id => required.includes(id)).length;
    const isFullPass = correctCount === 4 && ppeSelections.length === 4;

    setPpeSubmitted(true);
    setPpeFeedback({
      isPass: isFullPass,
      score: Math.round((correctCount / 4) * 100),
      message: isFullPass
        ? "Excellent! High-vis vest, composite-toe boots, safety helmet, and protective gloves meet UK warehouse health and safety standards."
        : "Review your selection. Warehouse environments require 360-degree high-vis, safety footwear, helmet protection, and puncture gloves."
    });
    if (isFullPass) {
      awardOnce('ppe', 100);
      showToast("Activity Complete: +100 Safety Points Awarded!", 'success');
    }
  };

  const resetPpeActivity = () => {
    setPpeSelections([]);
    setPpeSubmitted(false);
    setPpeFeedback(null);
  };

  // Interactive Hazard Spotting
  const registerHazardFound = (hazard) => {
    if (!foundHazards.includes(hazard.id)) {
      const updated = [...foundHazards, hazard.id];
      setFoundHazards(updated);
      setSafetyPoints(prev => prev + 50);
      showToast(`Hazard Spotted: ${hazard.name} (+50 Points)`, 'warning');
    }
    setActiveHazardModal(hazard);
  };

  // Interactive Scenario
  const submitScenario = (optionId) => {
    setSelectedScenarioOption(optionId);
    setScenarioSubmitted(true);
    if (optionId === 'C') {
      awardOnce('scenario', 100);
      showToast('Correct action chosen! (+100 Points)', 'success');
    }
  };

  const resetScenario = () => {
    setSelectedScenarioOption(null);
    setScenarioSubmitted(false);
  };

  // Quiz Engine
  const answerQuizQuestion = (qId, optionIdx) => {
    setQuizAnswers({ ...quizAnswers, [qId]: optionIdx });
  };

  const submitQuiz = () => {
    if (quizSubmitted || !practiceComplete || !adminQuestions.length || adminQuestions.some(q => quizAnswers[q.id] === undefined)) return false;
    let scoreCount = 0;
    adminQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        scoreCount += 1;
      }
    });

    const percentage = Math.round((scoreCount / adminQuestions.length) * 100);
    const passed = percentage >= adminPassMark;
    const nowIso = new Date().toISOString();
    const empId = currentUser?.id || "EMP-4091";
    const empName = currentUser?.name || "Alex Morgan";
    const empDept = currentUser?.department || "Bay 4 Inbound Logistics";
    const cleanId = empId.replace(/[^a-zA-Z0-9]/g, '');
    const certNum = `CERT-${cleanId}-MH-2026-${String(certificates.length + 1).padStart(3, '0')}`;

    const newAttempt = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `att-${Date.now()}`,
      employeeId: empId,
      employeeName: empName,
      department: empDept,
      moduleId: 'hse-303',
      moduleTitle: 'Manual Handling & Ergonomics',
      moduleCode: 'HSE-303',
      completedAt: nowIso,
      score: percentage,
      passed,
      passMark: adminPassMark,
      completionStatus: passed ? 'Completed' : 'In Progress',
      certificateEligible: passed,
      certificateId: passed ? certNum : null,
      answers: { ...quizAnswers },
      questions: adminQuestions.map(q => ({ ...q, options: [...q.options] }))
    };

    setAttempts(prev => [newAttempt, ...prev]);
    setQuizScore(percentage);
    setQuizPassed(passed);
    if (!passed) setPracticeComplete(false);
    setQuizSubmitted(true);

    if (passed) {
      awardOnce('assessment', 250);
      if (empId === sampleUsers[0].id) {
        setCompletedModules(prev => [...new Set([...prev, 'hse-303'])]);
      }
      setUsersList(prev => prev.map(u => {
        if (u.id.toLowerCase() === empId.toLowerCase()) {
          const updated = [...new Set([...(u.completedModules || []), 'hse-303'])];
          const userAttempts = [newAttempt, ...attempts.filter(a => a.employeeId?.toLowerCase() === empId.toLowerCase())];
          const newAvg = Math.round(userAttempts.reduce((n, a) => n + a.score, 0) / userAttempts.length);
          return {
            ...u,
            completedModules: updated,
            progress: Math.round((updated.length / Math.max(1, modules.length)) * 100),
            avgScore: newAvg,
            lastActive: 'Just now'
          };
        }
        return u;
      }));
      setCurrentUser(prev => prev ? {
        ...prev,
        completedModules: [...new Set([...(prev.completedModules || []), 'hse-303'])]
      } : prev);

      // Generate credible certificate with automotive client context
      const newCert = {
        id: `CERT-HSE-303-${Date.now()}`,
        certificateNumber: certNum,
        courseName: "Warehouse Safety & Manual Handling Compliance",
        moduleCode: "HSE-303",
        employeeName: empName,
        employeeId: empId,
        department: empDept,
        organisation: "Logistics & Warehousing Company – Automotive Sector",
        issueDate: nowIso.split('T')[0],
        score: percentage,
        status: "Certified Compliant",
        instructor: "Marcus Vance, Lead Safety Auditor & Shift Supervisor"
      };
      setCertificates(prev => [newCert, ...prev.filter(c => !(c.employeeId === empId && c.moduleCode === 'HSE-303'))]);
      showToast(`Assessment Passed with ${percentage}%! Certificate Generated.`, 'success');
    } else {
      showToast(`Score: ${percentage}%. You need ${adminPassMark}% to pass. Please review lessons and retry.`, 'warning');
    }
  };

  const resetQuiz = () => {
    if (quizSubmitted && !quizPassed) { setPracticeComplete(false); setCurrentView('manual-handling'); }
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizPassed(false);
  };

  const getModuleStatus = (modId, userId = currentUser?.id) => {
    if (!modId) return 'Assigned';
    const targetId = userId || currentUser?.id;
    const isDone = isModuleCompleted(modId, targetId);
    if (isDone) return 'Completed';

    const userAssignments = assignments.filter(a => a.employeeId?.toLowerCase() === targetId?.toLowerCase() && a.moduleId === modId);
    const assignment = userAssignments[0];
    const todayStr = new Date().toISOString().slice(0, 10);
    if (assignment?.due && assignment.due < todayStr) return 'Overdue';

    const prog = targetId === sampleUsers[0].id ? (lessonProgress[modId] || 0) : 0;
    if (prog > 0) return 'In Progress';

    if (assignment) return 'Assigned';

    return 'Assigned';
  };

  return (
    <TrainingContext.Provider
      value={{
        currentUser,
        currentView,
        setCurrentView,
        loginModalOpen,
        setLoginModalOpen,
        loginAs,
        logout,
        modules: modules.map(m => {
          const isDone = activeCompletedModules.includes(m.id);
          return {
            ...m,
            progress: isDone ? 100 : (currentUser?.id === sampleUsers[0].id ? Math.round(((lessonProgress[m.id] || 0) / Math.max(1, m.lessons.length)) * (m.id === 'hse-303' ? 50 : 100)) : 0)
          };
        }),
        lessonProgress, practiceComplete, finishPractice, attempts, assignments, setAssignments, isModuleCompleted,
        getModuleStatus,
        setModules,
        activeModuleId,
        setActiveModuleId,
        activeLessonIndex,
        setActiveLessonIndex,
        openModule,
        completeActiveLesson,
        completedModules: activeCompletedModules,
        safetyPoints,
        certificates,
        viewingCertificate,
        setViewingCertificate,
        // PPE
        ppeSelections,
        ppeSubmitted,
        ppeFeedback,
        togglePpeItem,
        submitPpeActivity,
        resetPpeActivity,
        // Hazards
        foundHazards,
        activeHazardModal,
        setActiveHazardModal,
        registerHazardFound,
        // Scenario
        selectedScenarioOption,
        scenarioSubmitted,
        submitScenario,
        resetScenario,
        // Quiz
        quizQuestions: adminQuestions,
        quizAnswers,
        quizSubmitted,
        quizScore,
        quizPassed,
        adminPassMark,
        answerQuizQuestion,
        submitQuiz,
        resetQuiz,
        // Admin Management
        usersList,
        setUsersList,
        adminQuestions,
        setAdminQuestions,
        setAdminPassMark,
        notifications,
        setNotifications,
        auditNotes,
        setAuditNotes,
        sendReminder,
        logAuditNote,
        updateUserPermissions,
        updateModuleContent,
        selectedAuditUser: usersList.find(u => u.id === selectedAuditUser.id) || selectedAuditUser,
        setSelectedAuditUser,
        toastMessage,
        showToast
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}