
    function calcularAvaliacao() {
        // 1. OBTER VALORES DAS PROVAS
        const p1 = parseFloat(document.getElementById('p1').value) || 0;
        const p2 = parseFloat(document.getElementById('p2').value) || 0;
        const p3 = parseFloat(document.getElementById('p3').value) || 0;
        const p4 = parseFloat(document.getElementById('p4').value) || 0;
        
        // 2. CALCULAR MÉDIA DAS PROVAS (70% do total)
        const mediaProvas = (p1 + p2 + p3 + p4) / 4;
        
        // 3. ADICIONAR PONTOS POR ATIVIDADES (Tarefas e Qualidade)
        const tarefasPonto = parseInt(document.getElementById('tarefasPonto').value);
        const qualidadeProjeto = parseInt(document.getElementById('qualidadeProjeto').value);
        const bonusAtividades = (tarefasPonto + qualidadeProjeto) * 0.5;
        
        // 4. CALCULAR ENVOLVIMENTO (30% do total)
        const likes = parseInt(document.getElementById('likes').value);
        const partilhas = parseInt(document.getElementById('partilhas').value);
        const eventos = parseInt(document.getElementById('eventos').value);
        const envolvimentoTotal = likes + partilhas + eventos;
        
        // Converter envolvimento para escala 0-20
        const envolvimentoEscala = (envolvimentoTotal / 15) * 20;
        
        // 5. CALCULAR PENALIZAÇÕES
        const atrasos = parseInt(document.getElementById('atrasos').value);
        const faltas = parseInt(document.getElementById('faltas').value);
        const penalizacoesTotal = atrasos + faltas;
        
        // 6. CALCULAR NOTA FINAL (Fórmula Principal)
        const notaFinal = (mediaProvas * 0.7) + (envolvimentoEscala * 0.3) - penalizacoesTotal;
        
        // 7. ARREDONDAR E GARANTIR LIMITES
        const notaFinalAjustada = Math.max(0, Math.min(20, Math.round(notaFinal * 10) / 10));
        
        // 8. DETERMINAR CLASSIFICAÇÃO
        let classificacao = "";
        let cor = "";
        
        if (notaFinalAjustada >= 17) {
            classificacao = "⭐ MUITO BOM ⭐";
            cor = "bg-gradient-to-r from-green-500 to-emerald-600";
        } else if (notaFinalAjustada >= 14) {
            classificacao = "👍 BOM";
            cor = "bg-gradient-to-r from-blue-500 to-cyan-600";
        } else if (notaFinalAjustada >= 10) {
            classificacao = "✅ SUFICIENTE";
            cor = "bg-gradient-to-r from-yellow-500 to-orange-500";
        } else if (notaFinalAjustada >= 5) {
            classificacao = "⚠️ PÉSSIMO";
            cor = "bg-gradient-to-r from-orange-500 to-red-500";
        } else {
            classificacao = "❌ MUITO PÉSSIMO";
            cor = "bg-gradient-to-r from-red-600 to-red-800";
        }
        
        // 9. EXIBIR RESULTADOS
        document.getElementById('mediaProvas').textContent = mediaProvas.toFixed(1);
        document.getElementById('envolvimento').textContent = envolvimentoEscala.toFixed(1);
        document.getElementById('penalizacoes').textContent = "-" + penalizacoesTotal.toFixed(1);
        document.getElementById('notaFinal').textContent = notaFinalAjustada.toFixed(1);
        document.getElementById('classificacao').textContent = classificacao;
        document.getElementById('classificacao').className = `${cor} inline-block px-6 py-3 rounded-full text-white font-bold text-lg`;
        
        // 10. DETALHES DO CÁLCULO
        const detalhes = `
            • Média das Provas: ${mediaProvas.toFixed(1)} pontos<br>
            • Bónus por Atividades: +${bonusAtividades.toFixed(1)} pontos<br>
            • Envolvimento: ${envolvimentoEscala.toFixed(1)} pontos<br>
            • Penalizações: -${penalizacoesTotal.toFixed(1)} pontos<br>
            <br>
            <strong>Fórmula:</strong> (${mediaProvas.toFixed(1)} × 0.7) + (${envolvimentoEscala.toFixed(1)} × 0.3) - ${penalizacoesTotal.toFixed(1)} = <strong>${notaFinalAjustada.toFixed(1)}</strong>
        `;
        document.getElementById('detalhes').innerHTML = detalhes;
        
        // Mostrar resultados
        document.getElementById('resultados').classList.remove('hidden');
    }
    
    // Calcular automaticamente ao carregar com valores padrão
    window.onload = calcularAvaliacao;