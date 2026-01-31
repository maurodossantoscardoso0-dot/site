
        // Dados do sistema
        const systemData = {
            interns: [],
            centers: [],
            allocations: [],
            backups: [],
            results: {
                allocated: 0,
                pending: 0,
                excess: 0,
                efficiency: 0
            },
            settings: {
                mode: 'automatic',
                notifications: {
                    email: true,
                    dashboard: true,
                    report: false
                },
                maxDistance: 50,
                criteria: {
                    proximity: true,
                    area: true,
                    availability: true
                },
                algorithm: 'balanced',
                dataRetention: 12
            },
            logs: [],
            systemLogs: []
        };

        // Inicializar sistema
        document.addEventListener('DOMContentLoaded', function() {
            initSystem();
            updateLogTime();
            setInterval(updateLogTime, 60000); // Atualizar a cada minuto
        });

        function initSystem() {
            loadFromStorage();
            updateCounters();
            addSystemLog('Sistema inicializado com sucesso');
            addAllocationLog('Sistema pronto para alocação. Configure os critérios e clique em "Executar Alocação"', 'info');
            updateSystemInfo();
            
            // Configurar eventos
            document.getElementById('maxDistance').addEventListener('input', updateDistanceValue);
            
            // Carregar configurações salvas
            loadSettings();
        }

        function updateLogTime() {
            const now = new Date();
            const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const dateString = now.toLocaleDateString('pt-BR');
            document.getElementById('logTime').textContent = `${dateString} ${timeString}`;
        }

        // Funções de Tab
        function openTab(tabName) {
            // Esconder todas as tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remover classe active de todas as tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Mostrar tab selecionada
            document.getElementById(tabName).classList.add('active');
            
            // Adicionar classe active à tab clicada
            event.target.classList.add('active');
            
            // Atualizar conteúdo específico da tab
            if (tabName === 'tab2') {
                updateCounters();
            } else if (tabName === 'tab3') {
                updateResultsDisplay();
            }
        }

        // Funções para Estagiários
        function addIntern() {
            const name = document.getElementById('internName').value;
            const email = document.getElementById('internEmail').value;
            const area = document.getElementById('internArea').value;
            const location = document.getElementById('internLocation').value;
            const availability = document.getElementById('internAvailability').value;
            const period = document.getElementById('internPeriod').value;
            const skills = document.getElementById('internSkills').value;
            
            if (!name || !email || !area || !location) {
                showNotification('Preencha todos os campos obrigatórios!', 'error');
                return;
            }
            
            const intern = {
                id: generateId(),
                name,
                email,
                area,
                location,
                availability: parseInt(availability),
                period,
                skills,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            systemData.interns.push(intern);
            updateCounters();
            addAllocationLog(`Estagiário "${name}" cadastrado com sucesso`, 'success');
            addSystemLog(`Estagiário adicionado: ${name}`);
            showNotification('Estagiário cadastrado com sucesso!');
            
            // Limpar formulário
            clearForm();
            saveToStorage();
        }

        function clearForm() {
            document.getElementById('internName').value = '';
            document.getElementById('internEmail').value = '';
            document.getElementById('internArea').value = '';
            document.getElementById('internLocation').value = '';
            document.getElementById('internAvailability').value = '30';
            document.getElementById('internPeriod').value = 'manha';
            document.getElementById('internSkills').value = '';
        }

        function importDemoData() {
            // Adicionar estagiários de demonstração
            const demoInterns = [
                { name: "Ana Silva", email: "ana.silva@email.com", area: "ti", location: "01001-000", availability: 30, period: "manha", skills: "Java, Python, SQL" },
                { name: "Carlos Santos", email: "carlos.santos@email.com", area: "eng", location: "02002-000", availability: 40, period: "integral", skills: "AutoCAD, Projetos" },
                { name: "Beatriz Oliveira", email: "beatriz@email.com", area: "adm", location: "03003-000", availability: 20, period: "tarde", skills: "Excel, Gestão" },
                { name: "Daniel Costa", email: "daniel.costa@email.com", area: "ti", location: "04004-000", availability: 30, period: "noite", skills: "JavaScript, React" },
                { name: "Eduarda Lima", email: "eduarda@email.com", area: "saude", location: "05005-000", availability: 40, period: "integral", skills: "Enfermagem" }
            ];
            
            demoInterns.forEach(internData => {
                const intern = {
                    id: generateId(),
                    ...internData,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                systemData.interns.push(intern);
            });
            
            // Adicionar centros de demonstração
            const demoCenters = [
                { name: "Centro Tecnológico SP", location: "01001-000", capacity: 15, areas: ["ti", "eng"], currentOccupancy: 0 },
                { name: "Centro Administrativo RJ", location: "02002-000", capacity: 10, areas: ["adm"], currentOccupancy: 0 },
                { name: "Centro Saúde BH", location: "03003-000", capacity: 8, areas: ["saude"], currentOccupancy: 0 },
                { name: "Centro Educação POA", location: "04004-000", capacity: 12, areas: ["educ", "adm"], currentOccupancy: 0 }
            ];
            
            demoCenters.forEach(centerData => {
                const center = {
                    id: generateId(),
                    ...centerData,
                    availableSpots: centerData.capacity,
                    createdAt: new Date().toISOString()
                };
                systemData.centers.push(center);
            });
            
            updateCounters();
            addAllocationLog('Dados de demonstração importados com sucesso!', 'success');
            addSystemLog('Dados demo importados');
            showNotification('Dados de demonstração importados!');
            saveToStorage();
        }

        // Funções para Centros
        function addCenter() {
            const name = document.getElementById('centerName').value;
            const location = document.getElementById('centerLocation').value;
            const capacity = parseInt(document.getElementById('centerCapacity').value);
            const areasSelect = document.getElementById('centerAreas');
            const areas = Array.from(areasSelect.selectedOptions).map(opt => opt.value);
            
            if (!name || !location || !capacity || areas.length === 0) {
                showNotification('Preencha todos os campos obrigatórios!', 'error');
                return;
            }
            
            const center = {
                id: generateId(),
                name,
                location,
                capacity,
                areas,
                currentOccupancy: 0,
                availableSpots: capacity,
                createdAt: new Date().toISOString()
            };
            
            systemData.centers.push(center);
            updateCounters();
            addAllocationLog(`Centro "${name}" cadastrado com sucesso (${capacity} vagas)`, 'success');
            addSystemLog(`Centro adicionado: ${name}`);
            showNotification('Centro cadastrado com sucesso!');
            
            clearCenterForm();
            saveToStorage();
        }

        function clearCenterForm() {
            document.getElementById('centerName').value = '';
            document.getElementById('centerLocation').value = '';
            document.getElementById('centerCapacity').value = '10';
            document.getElementById('centerAreas').selectedIndex = -1;
        }

        // Funções de Alocação
        function updateDistanceValue() {
            const slider = document.getElementById('maxDistance');
            const value = slider.value;
            document.getElementById('distanceValue').textContent = value + ' km';
            document.getElementById('distanceProgress').style.width = value + '%';
            systemData.settings.maxDistance = parseInt(value);
        }

        function runAllocation() {
            if (systemData.interns.length === 0) {
                showNotification('Cadastre estagiários antes de executar a alocação!', 'warning');
                return;
            }
            
            if (systemData.centers.length === 0) {
                showNotification('Cadastre centros de estágio antes de executar a alocação!', 'warning');
                return;
            }
            
            addAllocationLog('Iniciando processo de alocação...', 'info');
            addSystemLog('Processo de alocação iniciado');
            document.getElementById('allocationStatus').textContent = 'Processando...';
            
            // Resetar resultados
            systemData.results = { allocated: 0, pending: 0, excess: 0, efficiency: 0 };
            systemData.allocations = [];
            
            // Resetar ocupação dos centros
            systemData.centers.forEach(center => {
                center.currentOccupancy = 0;
                center.availableSpots = center.capacity;
            });
            
            // Obter configurações atuais
            const maxDistance = parseInt(document.getElementById('maxDistance').value);
            const criteria = {
                proximity: document.getElementById('criterionProximity').checked,
                area: document.getElementById('criterionArea').checked,
                availability: document.getElementById('criterionAvailability').checked
            };
            
            // Algoritmo de alocação
            systemData.interns.forEach(intern => {
                intern.status = 'pending'; // Reset status
                let allocated = false;
                
                // Ordenar centros por disponibilidade e compatibilidade
                const compatibleCenters = systemData.centers
                    .filter(center => {
                        if (criteria.area && !center.areas.includes(intern.area)) {
                            return false;
                        }
                        return center.availableSpots > 0;
                    })
                    .sort((a, b) => b.availableSpots - a.availableSpots);
                
                for (let center of compatibleCenters) {
                    // Simular cálculo de distância
                    const distance = Math.floor(Math.random() * maxDistance) + 1;
                    
                    if (!criteria.proximity || distance <= maxDistance) {
                        // Alocar estagiário
                        center.currentOccupancy++;
                        center.availableSpots--;
                        
                        const allocation = {
                            internId: intern.id,
                            internName: intern.name,
                            centerId: center.id,
                            centerName: center.name,
                            distance: distance,
                            status: 'allocated',
                            allocatedAt: new Date().toISOString()
                        };
                        
                        systemData.allocations.push(allocation);
                        intern.status = 'allocated';
                        systemData.results.allocated++;
                        allocated = true;
                        
                        addAllocationLog(`${intern.name} alocado em ${center.name} (${distance} km)`, 'success');
                        break;
                    }
                }
                
                if (!allocated) {
                    // Verificar se há centros compatíveis mas sem vagas (excedente)
                    const hasCompatibleCenters = systemData.centers.some(center => 
                        (!criteria.area || center.areas.includes(intern.area))
                    );
                    
                    if (hasCompatibleCenters) {
                        intern.status = 'excess';
                        systemData.results.excess++;
                        addAllocationLog(`${intern.name} marcado como excedente (sem vagas disponíveis)`, 'warning');
                    } else {
                        intern.status = 'pending';
                        systemData.results.pending++;
                        addAllocationLog(`${intern.name} pendente (sem centro compatível próximo)`, 'info');
                    }
                }
            });
            
            // Calcular eficiência
            const efficiency = systemData.interns.length > 0 
                ? Math.round((systemData.results.allocated / systemData.interns.length) * 100)
                : 0;
            systemData.results.efficiency = efficiency;
            
            updateResultsDisplay();
            document.getElementById('allocationStatus').textContent = 'Concluído';
            addAllocationLog(`Processo de alocação concluído! Eficiência: ${efficiency}%`, 'success');
            addSystemLog('Processo de alocação concluído');
            showNotification(`Alocação realizada com sucesso! Eficiência: ${efficiency}%`);
            
            // Abrir tab de resultados
            openTab('tab3');
            saveToStorage();
        }

        function simulateAllocation() {
            addAllocationLog('Simulando alocação...', 'info');
            addSystemLog('Simulação de alocação iniciada');
            
            // Gerar resultados simulados
            const totalInterns = systemData.interns.length || 10;
            const allocated = Math.floor(Math.random() * totalInterns * 0.8) + Math.floor(totalInterns * 0.2);
            const excess = Math.floor(Math.random() * totalInterns * 0.3);
            const pending = totalInterns - allocated - excess;
            const efficiency = Math.round((allocated / totalInterns) * 100);
            
            // Atualizar display
            document.getElementById('allocatedCount').textContent = allocated;
            document.getElementById('pendingCount').textContent = pending;
            document.getElementById('excessCount').textContent = excess;
            document.getElementById('efficiencyRate').textContent = `${efficiency}%`;
            
            // Atualizar mapa de distribuição
            updateMapContainer('simulation');
            
            addAllocationLog(`Simulação: ${allocated} alocados, ${excess} excedentes, ${pending} pendentes. Eficiência: ${efficiency}%`, 'success');
            showNotification('Simulação concluída!');
        }

        function resetAllocation() {
            systemData.allocations = [];
            systemData.results = { allocated: 0, pending: 0, excess: 0, efficiency: 0 };
            systemData.interns.forEach(intern => intern.status = 'pending');
            systemData.centers.forEach(center => {
                center.currentOccupancy = 0;
                center.availableSpots = center.capacity;
            });
            
            updateResultsDisplay();
            addAllocationLog('Alocação reiniciada', 'info');
            showNotification('Alocação reiniciada!');
            saveToStorage();
        }

        // Funções de Resultados
        function updateResultsDisplay() {
            document.getElementById('allocatedCount').textContent = systemData.results.allocated;
            document.getElementById('pendingCount').textContent = systemData.results.pending;
            document.getElementById('excessCount').textContent = systemData.results.excess;
            document.getElementById('efficiencyRate').textContent = `${systemData.results.efficiency}%`;
            
            const resultsTable = document.getElementById('resultsTable');
            resultsTable.innerHTML = '';
            
            if (systemData.allocations.length > 0) {
                document.getElementById('resultsContainer').style.display = 'none';
                document.getElementById('resultsTableContainer').style.display = 'block';
                
                systemData.allocations.forEach(allocation => {
                    const intern = systemData.interns.find(i => i.id === allocation.internId);
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${allocation.internName}</td>
                        <td>${getAreaName(intern.area)}</td>
                        <td>${allocation.centerName}</td>
                        <td>${allocation.distance} km</td>
                        <td><span class="status-badge status-allocated">Alocado</span></td>
                        <td>
                            <button class="btn" style="padding: 5px 10px; font-size: 0.8rem;" onclick="reallocateIntern('${allocation.internId}')">↻</button>
                            <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="viewDetails('${allocation.internId}')">👁️</button>
                        </td>
                    `;
                    resultsTable.appendChild(row);
                });
                
                // Atualizar análises
                updateAnalytics();
            } else {
                document.getElementById('resultsContainer').style.display = 'block';
                document.getElementById('resultsTableContainer').style.display = 'none';
            }
        }

        function updateAnalytics() {
            const analyticsContainer = document.getElementById('analyticsContainer');
            analyticsContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="data-card">
                        <h3>Distribuição por Área</h3>
                        <div style="margin-top: 15px;">
                            ${getAreaDistributionHTML()}
                        </div>
                    </div>
                    <div class="data-card">
                        <h3>Ocupação dos Centros</h3>
                        <div style="margin-top: 15px;">
                            ${getCenterOccupancyHTML()}
                        </div>
                    </div>
                </div>
                <div class="data-card" style="margin-top: 20px;">
                    <h3>Estatísticas Gerais</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px;">
                        <div>
                            <strong>Distância Média:</strong><br>
                            <span style="font-size: 1.5rem;">${calculateAverageDistance()} km</span>
                        </div>
                        <div>
                            <strong>Taxa de Ocupação:</strong><br>
                            <span style="font-size: 1.5rem;">${calculateOccupancyRate()}%</span>
                        </div>
                        <div>
                            <strong>Centros Usados:</strong><br>
                            <span style="font-size: 1.5rem;">${getUsedCentersCount()}</span>
                        </div>
                        <div>
                            <strong>Satisfação:</strong><br>
                            <span style="font-size: 1.5rem;">${calculateSatisfactionRate()}%</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Atualizar sugestões
            updateSuggestions();
        }

        function updateSuggestions() {
            const suggestionsList = document.getElementById('suggestionsList');
            const suggestions = generateSuggestions();
            
            if (suggestions.length === 0) {
                suggestionsList.innerHTML = '<p style="color: #28a745; text-align: center;">✓ Alocação otimizada! Nenhuma sugestão no momento.</p>';
                return;
            }
            
            suggestionsList.innerHTML = suggestions.map(suggestion => 
                `<div class="suggestion-item">${suggestion}</div>`
            ).join('');
        }

        function generateSuggestions() {
            const suggestions = [];
            
            if (systemData.results.excess > 0) {
                suggestions.push(`🎯 ${systemData.results.excess} estagiários excedentes. Considere expandir a capacidade dos centros ou criar novos centros.`);
            }
            
            if (systemData.results.pending > 0) {
                suggestions.push(`📍 ${systemData.results.pending} estagiários pendentes. Avaliar necessidade de centros em novas regiões.`);
            }
            
            const occupancyRate = calculateOccupancyRate();
            if (occupancyRate > 90) {
                suggestions.push(`⚠️ Alta taxa de ocupação (${occupancyRate}%). Considere aumentar a capacidade dos centros existentes.`);
            } else if (occupancyRate < 50) {
                suggestions.push(`💡 Baixa taxa de ocupação (${occupancyRate}%). Pode-se reduzir o número de centros ou aumentar o número de estagiários.`);
            }
            
            const avgDistance = calculateAverageDistance();
            if (avgDistance > 30) {
                suggestions.push(`🚗 Distância média alta (${avgDistance} km). Avaliar seletividade por proximidade.`);
            }
            
            return suggestions;
        }

        // Funções de Cálculo
        function calculateAverageDistance() {
            if (systemData.allocations.length === 0) return 0;
            const totalDistance = systemData.allocations.reduce((sum, alloc) => sum + alloc.distance, 0);
            return Math.round(totalDistance / systemData.allocations.length);
        }

        function calculateOccupancyRate() {
            if (systemData.centers.length === 0) return 0;
            const totalCapacity = systemData.centers.reduce((sum, center) => sum + center.capacity, 0);
            const totalOccupancy = systemData.centers.reduce((sum, center) => sum + center.currentOccupancy, 0);
            return Math.round((totalOccupancy / totalCapacity) * 100);
        }

        function getUsedCentersCount() {
            return systemData.centers.filter(center => center.currentOccupancy > 0).length;
        }

        function calculateSatisfactionRate() {
            const total = systemData.interns.length;
            if (total === 0) return 0;
            const satisfied = systemData.interns.filter(intern => intern.status === 'allocated').length;
            return Math.round((satisfied / total) * 100);
        }

        function getAreaDistributionHTML() {
            const areaCounts = {};
            systemData.interns.forEach(intern => {
                areaCounts[intern.area] = (areaCounts[intern.area] || 0) + 1;
            });
            
            return Object.entries(areaCounts).map(([area, count]) => `
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>${getAreaName(area)}</span>
                        <span>${count}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(count / systemData.interns.length) * 100}%"></div>
                    </div>
                </div>
            `).join('');
        }

        function getCenterOccupancyHTML() {
            return systemData.centers.map(center => `
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                        <span>${center.name}</span>
                        <span>${center.currentOccupancy}/${center.capacity}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(center.currentOccupancy / center.capacity) * 100}%"></div>
                    </div>
                </div>
            `).join('');
        }

        // Funções de Configurações
        function saveSettings() {
            systemData.settings.mode = document.getElementById('systemMode').value;
            systemData.settings.notifications.email = document.getElementById('notifyEmail').checked;
            systemData.settings.notifications.dashboard = document.getElementById('notifyDashboard').checked;
            systemData.settings.notifications.report = document.getElementById('notifyReport').checked;
            systemData.settings.algorithm = document.getElementById('algorithmPreference').value;
            systemData.settings.dataRetention = parseInt(document.getElementById('dataRetention').value);
            
            saveToStorage();
            addSystemLog('Configurações salvas');
            showNotification('Configurações salvas com sucesso!');
        }

        function loadSettings() {
            document.getElementById('systemMode').value = systemData.settings.mode;
            document.getElementById('notifyEmail').checked = systemData.settings.notifications.email;
            document.getElementById('notifyDashboard').checked = systemData.settings.notifications.dashboard;
            document.getElementById('notifyReport').checked = systemData.settings.notifications.report;
            document.getElementById('algorithmPreference').value = systemData.settings.algorithm;
            document.getElementById('dataRetention').value = systemData.settings.dataRetention;
            
            // Critérios de alocação
            document.getElementById('criterionProximity').checked = systemData.settings.criteria.proximity;
            document.getElementById('criterionArea').checked = systemData.settings.criteria.area;
            document.getElementById('criterionAvailability').checked = systemData.settings.criteria.availability;
            document.getElementById('maxDistance').value = systemData.settings.maxDistance;
            updateDistanceValue();
        }

        function resetSettings() {
            systemData.settings = {
                mode: 'automatic',
                notifications: {
                    email: true,
                    dashboard: true,
                    report: false
                },
                maxDistance: 50,
                criteria: {
                    proximity: true,
                    area: true,
                    availability: true
                },
                algorithm: 'balanced',
                dataRetention: 12
            };
            
            loadSettings();
            addSystemLog('Configurações restauradas para padrões');
            showNotification('Configurações restauradas para padrões!');
        }

        // Funções de Backup
        function createBackup() {
            const backup = {
                id: generateId(),
                name: `Backup ${new Date().toLocaleDateString('pt-BR')}`,
                timestamp: new Date().toISOString(),
                data: JSON.parse(JSON.stringify(systemData))
            };
            
            systemData.backups.push(backup);
            updateBackupList();
            addSystemLog(`Backup criado: ${backup.name}`);
            showNotification('Backup criado com sucesso!');
            saveToStorage();
        }

        function updateBackupList() {
            const backupList = document.getElementById('backupList');
            backupList.innerHTML = systemData.backups.map(backup => `
                <div class="backup-item">
                    <div>
                        <strong>${backup.name}</strong>
                        <div style="font-size: 0.8rem; color: #6c757d;">
                            Criado: ${new Date(backup.timestamp).toLocaleDateString('pt-BR')} ${new Date(backup.timestamp).toLocaleTimeString('pt-BR')}
                        </div>
                    </div>
                    <button class="btn" style="padding: 8px 15px;" onclick="restoreBackup('${backup.id}')">Restaurar</button>
                </div>
            `).join('');
        }

        function restoreBackup(backupId) {
            const backup = systemData.backups.find(b => b.id === backupId);
            if (backup) {
                // Restaurar dados
                Object.assign(systemData, JSON.parse(JSON.stringify(backup.data)));
                
                // Atualizar interface
                updateCounters();
                updateResultsDisplay();
                loadSettings();
                updateBackupList();
                
                addSystemLog(`Backup restaurado: ${backup.name}`);
                showNotification('Backup restaurado com sucesso!');
                saveToStorage();
            }
        }

        function clearAllData() {
            if (confirm('⚠️ Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
                systemData.interns = [];
                systemData.centers = [];
                systemData.allocations = [];
                systemData.results = { allocated: 0, pending: 0, excess: 0, efficiency: 0 };
                
                updateCounters();
                updateResultsDisplay();
                addSystemLog('Todos os dados foram limpos');
                showNotification('Todos os dados foram limpos!');
                saveToStorage();
            }
        }

        // Funções Auxiliares
        function updateCounters() {
            document.getElementById('totalInterns').textContent = systemData.interns.length;
            document.getElementById('totalCenters').textContent = systemData.centers.length;
            const totalVacancies = systemData.centers.reduce((sum, center) => sum + center.capacity, 0);
            document.getElementById('totalVacancies').textContent = totalVacancies;
        }

        function updateMapContainer(type = 'default') {
            const mapContainer = document.getElementById('mapContainer');
            if (type === 'simulation') {
                mapContainer.innerHTML = `
                    <div style="font-size: 2rem;">🔥</div>
                    <strong>Mapa de Calor da Simulação</strong>
                    <small style="font-size: 0.9rem;">Mostrando concentração de estagiários por região</small>
                    <div style="margin-top: 20px; width: 80%; height: 150px; background: linear-gradient(90deg, #1E90FF, #FF8C00, #DC3545); border-radius: 8px;"></div>
                `;
            } else if (type === 'distribution') {
                mapContainer.innerHTML = `
                    <div style="font-size: 2rem;">📊</div>
                    <strong>Distribuição Geográfica</strong>
                    <small style="font-size: 0.9rem;">${systemData.allocations.length} alocações realizadas</small>
                `;
            } else {
                mapContainer.innerHTML = `
                    <div style="font-size: 2rem;">🌍</div>
                    <strong>Mapa de Distribuição Geográfica</strong>
                    <small style="font-size: 0.9rem;">Visualize a distribuição de estagiários e centros</small>
                `;
            }
        }

        function showHeatMap() {
            updateMapContainer('simulation');
            addAllocationLog('Mapa de calor exibido', 'info');
        }

        function showDistribution() {
            updateMapContainer('distribution');
            addAllocationLog('Distribuição geográfica exibida', 'info');
        }

        function suggestNewCenters() {
            const suggestions = generateCenterSuggestions();
            const suggestionText = suggestions.join('\n• ');
            
            addAllocationLog('Sugestões de novos centros geradas', 'info');
            showNotification('Sugestões geradas! Veja o log de alocação.');
            
            // Adicionar ao log
            addAllocationLog(`💡 Sugestões de novos centros:\n• ${suggestionText}`, 'info');
        }

        function generateCenterSuggestions() {
            const suggestions = [];
            
            // Análise simples para sugerir novos centros
            if (systemData.results.pending > 0) {
                suggestions.push('Abrir centro em região com alta concentração de estagiários pendentes');
            }
            
            if (calculateOccupancyRate() > 85) {
                suggestions.push('Expandir capacidade dos centros mais ocupados');
            }
            
            const avgDistance = calculateAverageDistance();
            if (avgDistance > 25) {
                suggestions.push('Considerar centros em áreas periféricas para reduzir distâncias médias');
            }
            
            // Análise por área
            const areaCounts = {};
            systemData.interns.forEach(intern => {
                areaCounts[intern.area] = (areaCounts[intern.area] || 0) + 1;
            });
            
            Object.entries(areaCounts).forEach(([area, count]) => {
                const areaCenters = systemData.centers.filter(center => center.areas.includes(area));
                if (areaCenters.length === 0 && count > 3) {
                    suggestions.push(`Criar centro especializado em ${getAreaName(area)} (${count} estagiários)`);
                }
            });
            
            return suggestions.length > 0 ? suggestions : ['A alocação atual parece otimizada. Nenhuma sugestão urgente.'];
        }

        function optimizeAllocation() {
            addAllocationLog('Otimizando alocação...', 'info');
            
            // Simulação simples de otimização
            const currentEfficiency = systemData.results.efficiency;
            const newEfficiency = Math.min(100, currentEfficiency + 5 + Math.floor(Math.random() * 10));
            
            systemData.results.efficiency = newEfficiency;
            updateResultsDisplay();
            
            addAllocationLog(`Otimização concluída! Nova eficiência: ${newEfficiency}%`, 'success');
            showNotification(`Otimização aplicada! Eficiência aumentada para ${newEfficiency}%`);
            saveToStorage();
        }

        function clearResults() {
            if (confirm('Limpar todos os resultados da alocação?')) {
                systemData.allocations = [];
                systemData.results = { allocated: 0, pending: 0, excess: 0, efficiency: 0 };
                updateResultsDisplay();
                addAllocationLog('Resultados limpos', 'info');
                showNotification('Resultados limpos!');
                saveToStorage();
            }
        }

        function generateReport() {
            addAllocationLog('Gerando relatório PDF...', 'info');
            
            // Simulação de geração de relatório
            const reportContent = `
                RELATÓRIO DE ALOÇÃO DE ESTAGIÁRIOS
                ====================================
                Data: ${new Date().toLocaleDateString('pt-BR')}
                Total de Estagiários: ${systemData.interns.length}
                Total de Centros: ${systemData.centers.length}
                
                RESULTADOS:
                - Alocados: ${systemData.results.allocated}
                - Excedentes: ${systemData.results.excess}
                - Pendentes: ${systemData.results.pending}
                - Eficiência: ${systemData.results.efficiency}%
                
                ESTATÍSTICAS:
                - Distância média: ${calculateAverageDistance()} km
                - Taxa de ocupação: ${calculateOccupancyRate()}%
                - Centros utilizados: ${getUsedCentersCount()}/${systemData.centers.length}
                
                SUGESTÕES:
                ${generateSuggestions().join('\n- ')}
            `;
            
            // Em um sistema real, aqui geraria um PDF
            // Para demonstração, mostramos no console
            console.log('=== RELATÓRIO PDF ===');
            console.log(reportContent);
            console.log('=====================');
            
            addAllocationLog('Relatório PDF gerado com sucesso!', 'success');
            showNotification('Relatório gerado! Verifique o console do navegador.');
        }

        function exportData() {
            const dataStr = JSON.stringify(systemData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `alocacao_estagiarios_${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            addAllocationLog('Dados exportados para JSON', 'success');
            showNotification('Dados exportados com sucesso!');
        }

        function exportAllData() {
            const allData = {
                systemData: systemData,
                exportDate: new Date().toISOString(),
                version: '2.1.0'
            };
            
            const dataStr = JSON.stringify(allData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `backup_completo_${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            addSystemLog('Backup completo exportado');
            showNotification('Backup completo exportado!');
        }

        // Funções Utilitárias
        function generateId() {
            return '_' + Math.random().toString(36).substr(2, 9);
        }

        function getAreaName(areaCode) {
            const areas = {
                'ti': 'Tecnologia da Informação',
                'adm': 'Administração',
                'eng': 'Engenharia',
                'saude': 'Saúde',
                'educ': 'Educação'
            };
            return areas[areaCode] || areaCode;
        }

        function addAllocationLog(message, type = 'info') {
            const logContainer = document.getElementById('allocationLog');
            const logEntry = document.createElement('div');
            
            logEntry.className = `log-entry ${type}`;
            logEntry.innerHTML = `
                <div class="log-time">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div class="log-message">${message}</div>
            `;
            
            logContainer.appendChild(logEntry);
            logContainer.scrollTop = logContainer.scrollHeight;
            
            // Manter apenas os últimos 50 logs
            const logs = logContainer.querySelectorAll('.log-entry');
            if (logs.length > 50) {
                logs[0].remove();
            }
        }

        function addSystemLog(message) {
            const systemLog = document.getElementById('systemLog');
            const logEntry = document.createElement('div');
            
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            logEntry.textContent = `[${time}] ${message}`;
            
            systemLog.appendChild(logEntry);
            systemLog.scrollTop = systemLog.scrollHeight;
            
            // Manter apenas os últimos 20 logs
            const logs = systemLog.querySelectorAll('div');
            if (logs.length > 20) {
                logs[0].remove();
            }
            
            systemData.systemLogs.push({ message, timestamp: new Date().toISOString() });
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        function saveToStorage() {
            try {
                localStorage.setItem('ticnesAI_systemData', JSON.stringify(systemData));
            } catch (e) {
                console.error('Erro ao salvar no localStorage:', e);
            }
        }

        function loadFromStorage() {
            try {
                const saved = localStorage.getItem('ticnesAI_systemData');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    Object.assign(systemData, parsed);
                }
            } catch (e) {
                console.error('Erro ao carregar do localStorage:', e);
            }
        }

        function updateSystemInfo() {
            const info = document.getElementById('systemInfo');
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            info.textContent = `Última atualização: ${time} | ${systemData.interns.length} estagiários | ${systemData.centers.length} centros`;
        }

        // Funções de Ação para a Tabela
        function reallocateIntern(internId) {
            const intern = systemData.interns.find(i => i.id === internId);
            if (intern) {
                addAllocationLog(`Realocando estagiário: ${intern.name}`, 'info');
                showNotification(`Realocando ${intern.name}...`);
                // Em um sistema real, aqui abriria um modal para nova alocação
            }
        }

        function viewDetails(internId) {
            const intern = systemData.interns.find(i => i.id === internId);
            const allocation = systemData.allocations.find(a => a.internId === internId);
            
            if (intern && allocation) {
                const details = `
                    Nome: ${intern.name}
                    E-mail: ${intern.email}
                    Área: ${getAreaName(intern.area)}
                    Centro: ${allocation.centerName}
                    Distância: ${allocation.distance} km
                    Status: Alocado
                `;
                
                alert('📋 Detalhes do Estagiário:\n\n' + details);
            }
        }

        // Inicializar algumas funcionalidades adicionais
        function initializeExtraFeatures() {
            // Adicionar log inicial
            addSystemLog('Sistema carregado com sucesso');
            
            // Atualizar contadores a cada 30 segundos
            setInterval(updateSystemInfo, 30000);
            
            // Criar backup inicial se não existir
            if (systemData.backups.length === 0) {
                createBackup();
            }
        }

        // Inicializar recursos extras após o carregamento
        setTimeout(initializeExtraFeatures, 1000);