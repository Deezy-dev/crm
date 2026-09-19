/**
 * OSDEL TECNOLOGIA - Módulo de Missões em Equipa e Cortes por Rua
 * Permite a criação de piquetes de corte/religação em equipa com designação de líder,
 * selecção de técnicos, filtragem automática de devedores por rua e geração de PDF.
 */

import { addSystemNotification } from './notifications';

export interface MissionTask {
  id: string;
  clientId: number;
  clientCode: string;
  clientName: string;
  phone: string;
  address: string;
  street: string;
  houseCode?: string;
  pdoNumber: string;
  portNumber?: string;
  serviceType: 'tv' | 'internet' | 'combo';
  debtAmount: number;
  monthsLate: number;
  status: 'pendente' | 'cortado' | 'religado' | 'acordo_no_local' | 'ausente';
  completedAt?: string;
  completedBy?: string;
  observation?: string;
}

export interface TeamMission {
  id: string;
  code: string;
  title: string;
  type: 'corte' | 'religacao' | 'vistoria' | 'fusao' | 'instalacao';
  leaderId: number;
  leaderName: string;
  technicianIds: number[];
  technicianNames: string[];
  streets: string[];
  scheduledDate: string;
  status: 'pendente' | 'em_curso' | 'concluida' | 'cancelada';
  tasks: MissionTask[];
  notes?: string;
  createdAt: string;
  createdBy: string;
}

const STORAGE_KEY = 'osdel_team_missions';

const SEED_MISSIONS: TeamMission[] = [
  {
    id: 'mis-1',
    code: 'MIS-2024-001',
    title: 'Operação Piquete Relâmpago - Cortes Rua 12 e 13',
    type: 'corte',
    leaderId: 3,
    leaderName: 'Mestre Job (Job Batalha)',
    technicianIds: [3, 7, 8],
    technicianNames: ['Mestre Job (Líder)', 'Júlio Afonso', 'Enock Miguel'],
    streets: ['Rua 12', 'Rua 13'],
    scheduledDate: new Date().toISOString().slice(0, 10),
    status: 'em_curso',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdBy: 'deezy (Admin)',
    notes: 'Prioridade aos clientes com mais de 2 meses em atraso. Cobrar no local se o cliente apresentar dinheiro ou comprovativo Multicaixa válido.',
    tasks: [
      {
        id: 'task-101',
        clientId: 1,
        clientCode: 'CLI-00001',
        clientName: 'António Domingos Pedro',
        phone: '+244 923 456 789',
        address: 'Rua 12, Casa 45B, Bairro Golf I',
        street: 'Rua 12',
        houseCode: 'G1-C45B',
        pdoNumber: 'PDO-04',
        portNumber: 'Porta 03',
        serviceType: 'tv',
        debtAmount: 8000,
        monthsLate: 2,
        status: 'pendente',
      },
      {
        id: 'task-102',
        clientId: 5,
        clientCode: 'CLI-00005',
        clientName: 'Sebastião Zola Bento',
        phone: '+244 924 331 990',
        address: 'Rua 12, Vivenda 18, Golf I',
        street: 'Rua 12',
        houseCode: 'G1-V18',
        pdoNumber: 'PDO-04',
        portNumber: 'Porta 06',
        serviceType: 'internet',
        debtAmount: 13000,
        monthsLate: 2,
        status: 'cortado',
        completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        completedBy: 'Júlio Afonso',
        observation: 'Cabo desconectado e conector lacrado na caixa PDO-04.',
      },
      {
        id: 'task-103',
        clientId: 6,
        clientCode: 'CLI-00006',
        clientName: 'Margarida Costa da Rocha',
        phone: '+244 912 884 102',
        address: 'Rua 13, Casa 12A, Golf I',
        street: 'Rua 13',
        houseCode: 'G1-C12A',
        pdoNumber: 'PDO-05',
        portNumber: 'Porta 01',
        serviceType: 'combo',
        debtAmount: 25000,
        monthsLate: 3,
        status: 'pendente',
      },
      {
        id: 'task-104',
        clientId: 7,
        clientCode: 'CLI-00007',
        clientName: 'Domingos Garcia Lopes',
        phone: '+244 933 112 445',
        address: 'Rua 13, Casa 30, Golf I',
        street: 'Rua 13',
        houseCode: 'G1-C30',
        pdoNumber: 'PDO-05',
        portNumber: 'Porta 07',
        serviceType: 'tv',
        debtAmount: 12000,
        monthsLate: 3,
        status: 'acordo_no_local',
        completedAt: new Date(Date.now() - 3600000).toISOString(),
        completedBy: 'Mestre Job',
        observation: 'Cliente pagou 6.000 Kz no local em numerário e assinou promessa para o dia 20.',
      },
    ],
  },
  {
    id: 'mis-2',
    code: 'MIS-2024-002',
    title: 'Campanha de Vistoria e Alinhamento de Caixas - Rua 7 e 8',
    type: 'vistoria',
    leaderId: 3,
    leaderName: 'Mestre Job (Job Batalha)',
    technicianIds: [3, 8],
    technicianNames: ['Mestre Job (Líder)', 'Enock Miguel'],
    streets: ['Rua 7', 'Rua 8'],
    scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    status: 'pendente',
    createdAt: new Date().toISOString(),
    createdBy: 'Maria Teresa (Operadora)',
    notes: 'Verificar portas soltas nas caixas PDO-02 e PDO-03 e reparar sinal de clientes com queixa de atenuação.',
    tasks: [],
  },
];

export function getStoredMissions(): TeamMission[] {
  if (typeof window === 'undefined') return SEED_MISSIONS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MISSIONS));
    return SEED_MISSIONS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_MISSIONS;
  }
}

export function saveMissions(missions: TeamMission[]): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
    window.dispatchEvent(new CustomEvent('osdel-missions-updated', { detail: missions }));
  }
}

/**
 * Cria uma nova missão em equipa
 */
export function createTeamMission(
  data: Omit<TeamMission, 'id' | 'code' | 'createdAt'>,
): TeamMission {
  const existing = getStoredMissions();
  const nextNum = existing.length + 1;
  const year = new Date().getFullYear();
  const code = `MIS-${year}-${String(nextNum).padStart(3, '0')}`;
  const newMission: TeamMission = {
    ...data,
    id: `mis-${Date.now()}`,
    code,
    createdAt: new Date().toISOString(),
  };

  const updated = [newMission, ...existing];
  saveMissions(updated);

  // NOTIFICAR OS TÉCNICOS ESCALADOS
  try {
    addSystemNotification({
      title: `Nova Missão Designada: ${newMission.code}`,
      message: `Missão "${newMission.title}" agendada para ${newMission.scheduledDate} nas ruas ${newMission.streets.join(', ')}. Equipa: ${newMission.technicianNames.join(', ')}.`,
      type: 'alerta',
      roleTarget: 'technician',
      linkUrl: '/equipa-missoes',
    });
  } catch (err) {
    console.error('Erro ao emitir notificação de missão:', err);
  }

  return newMission;
}

/**
 * Conclui uma missão manualmente ou quando todas as tarefas forem finalizadas
 */
export function completeMission(missionId: string, completedBy = 'Piquete Técnico'): TeamMission | null {
  const missions = getStoredMissions();
  let completedMission: TeamMission | null = null;

  const updated = missions.map((m) => {
    if (m.id === missionId) {
      completedMission = {
        ...m,
        status: 'concluida',
      };
      return completedMission;
    }
    return m;
  });

  saveMissions(updated);

  if (completedMission) {
    try {
      addSystemNotification({
        title: `Missão Concluída: ${(completedMission as TeamMission).code}`,
        message: `A missão de piquete "${(completedMission as TeamMission).title}" foi concluída por ${completedBy} e transferida para o Histórico de Missões.`,
        type: 'sucesso',
        roleTarget: 'all',
        linkUrl: '/equipa-missoes',
      });
    } catch (err) {
      console.error('Erro ao emitir notificação de missão concluída:', err);
    }
  }

  return completedMission;
}

/**
 * Retorna as missões ativas (pendentes ou em curso)
 */
export function getActiveMissions(): TeamMission[] {
  return getStoredMissions().filter((m) => m.status === 'pendente' || m.status === 'em_curso');
}

/**
 * Retorna o histórico de missões concluídas ou arquivadas
 */
export function getMissionHistory(): TeamMission[] {
  return getStoredMissions().filter((m) => m.status === 'concluida' || m.status === 'cancelada');
}

/**
 * Atualiza o status de uma tarefa da missão e sincroniza com o status do cliente no sistema principal
 */
export function updateMissionTask(
  missionId: string,
  taskId: string,
  status: MissionTask['status'],
  technicianName: string,
  observation?: string,
): TeamMission | null {
  const missions = getStoredMissions();
  let targetTask: MissionTask | null = null;
  let missionJustCompleted = false;

  const updated = missions.map((m) => {
    if (m.id === missionId) {
      const updatedTasks = m.tasks.map((t) => {
        if (t.id === taskId) {
          targetTask = {
            ...t,
            status,
            completedAt: new Date().toISOString(),
            completedBy: technicianName,
            observation: observation || t.observation,
          };
          return targetTask;
        }
        return t;
      });

      // Check if all tasks are done
      const allDone = updatedTasks.length > 0 && updatedTasks.every((t) => t.status !== 'pendente');
      if (allDone && m.status !== 'concluida') {
        missionJustCompleted = true;
      }
      const newMissionStatus: TeamMission['status'] = allDone ? 'concluida' : 'em_curso';

      return {
        ...m,
        status: newMissionStatus,
        tasks: updatedTasks,
      };
    }
    return m;
  });

  saveMissions(updated);

  if (missionJustCompleted) {
    const concluded = updated.find((m) => m.id === missionId);
    if (concluded) {
      try {
        addSystemNotification({
          title: `Missão ${concluded.code} Concluída!`,
          message: `Todas as tarefas da missão "${concluded.title}" foram executadas no terreno. Transferida para o Histórico de Missões.`,
          type: 'sucesso',
          roleTarget: 'all',
          linkUrl: '/equipa-missoes',
        });
      } catch (err) {
        console.error('Erro ao disparar notificação:', err);
      }
    }
  }

  // SINCRONIZAÇÃO EM TEMPO REAL COM O SISTEMA PRINCIPAL
  if (targetTask && typeof window !== 'undefined') {
    try {
      const clientsRaw = window.localStorage.getItem('osdel_clients');
      if (clientsRaw) {
        let clientsList = JSON.parse(clientsRaw);
        clientsList = clientsList.map((c: any) => {
          if (c.id === (targetTask as any).clientId) {
            let newClientStatus = c.status;
            if (status === 'cortado') {
              newClientStatus = 'suspended';
            } else if (status === 'religado') {
              newClientStatus = 'active';
            }
            const updateLog = `[Piquete ${new Date().toLocaleDateString('pt-AO')}: Marcado como ${status.toUpperCase()} por ${technicianName}${observation ? ` - ${observation}` : ''}]`;
            return {
              ...c,
              status: newClientStatus,
              notes: c.notes ? `${c.notes}\n${updateLog}` : updateLog,
            };
          }
          return c;
        });
        window.localStorage.setItem('osdel_clients', JSON.stringify(clientsList));
        window.dispatchEvent(new Event('osdel-clients-updated'));
      }
    } catch (err) {
      console.error('Erro na sincronização de cliente com missão:', err);
    }
  }

  return updated.find((m) => m.id === missionId) || null;
}
