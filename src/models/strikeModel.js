var database = require("../database/config");

function listar(codInstituicao, texto) {
    console.log('no model' + codInstituicao + texto);
    var instrução = `
    SELECT maq.nome AS nome,
		DATE_FORMAT(str.dataHora, '%Y-%m-%dT%H:%i:%s') AS dataHora, 
        str.motivo AS motivo, 
        str.duracao AS duracao, 
        sit.situacao AS situacao 
        FROM strike AS str
			JOIN situacao AS sit ON sit.idSituacao = str.fkSituacao
			JOIN maquina AS maq ON maq.idMaquina = str.fkMaquina
				WHERE maq.fkInstituicao = ${codInstituicao} ${texto};
    `;

    console.log("Executando a instrução SQL: \n" + instrução);
    return database.executar(instrução);
}

function listarSituacao(codInstituicao, situacao) {
    console.log('no model');
    var instrução = `
    SELECT maq.nome AS nome,
		DATE_FORMAT(str.dataHora, '%Y-%m-%dT%H:%i:%s') AS dataHora, 
        str.motivo AS motivo, 
        str.duracao AS duracao, 
        sit.situacao AS situacao 
        FROM strike AS str
			JOIN situacao AS sit ON sit.idSituacao = str.fkSituacao
			JOIN maquina AS maq ON maq.idMaquina = str.fkMaquina
				WHERE situacao = '${situacao}' AND maq.fkInstituicao = ${codInstituicao};
    `;

    console.log("Executando a instrução SQL: \n" + instrução);
    return database.executar(instrução);
}

function contadores(codInstituicao) {
    console.log('no model');
    var instrução = `
    SELECT COUNT(idStrike) as 'total',
           COUNT(if(fkSituacao = 1 , 1 ,null)) as 'ativos',
           COUNT(if(fkSituacao = 2 ,1 ,null)) as 'inativos',
           COUNT(if(fkSituacao = 3 , 1 ,null)) as 'validos',
           COUNT(if(fkSituacao = 4 ,1 ,null)) as 'invalidos' FROM strike
			JOIN maquina ON idMaquina = fkMaquina
				WHERE fkMaquina = ${codInstituicao};
    `;

    console.log("Executando a instrução SQL: \n" + instrução);
    return database.executar(instrução);
}




function strikePMes(idInstituicao, qtdMes) {
    console.log("Cheguei nomodel  STRIKE")

    var instrucao = `
    SELECT COUNT(*) AS strikes
    FROM strike
    JOIN maquina ON strike.fkMaquina = maquina.idMaquina
    WHERE ${qtdMes} fkInstituicao = ${idInstituicao}
    `


    console.log("Executando a instrucao SQL: \n" + instrucao);
    return database.executar(instrucao);
}


function kpiInfos(idInstituicao){
    var instrucao = `
    SELECT 
       (SELECT COUNT(idStrike) FROM strike
       JOIN maquina ON strike.fkMaquina = maquina.idMaquina
       WHERE YEARWEEK(dataHora, 1) = YEARWEEK(CURDATE(), 1) AND fkInstituicao = ${idInstituicao}) as strikesNaSemana,
   
       (SELECT COUNT(idHistorico) FROM historico
       JOIN maquina ON historico.fkMaquina = maquina.idMaquina
       WHERE YEARWEEK(dataHora, 1) = YEARWEEK(CURDATE(), 1) AND fkInstituicao = ${idInstituicao}) as alertasNaSemana,
   
       (SELECT COUNT(DISTINCT m.idMaquina) AS totalMaquinas
        FROM maquina m
        WHERE m.fkInstituicao = ${idInstituicao}) AS totalMaquinas,
   
        (SELECT COUNT(DISTINCT m.idMaquina) AS maquinasComStrike
        FROM maquina m
        JOIN strike s ON m.idMaquina = s.fkMaquina
        WHERE DATE(s.dataHora) = CURDATE() AND s.fkSituacao = 1 AND m.fkInstituicao = ${idInstituicao}) as maquinasComStrike,
       
        (SELECT COUNT(DISTINCT m.idMaquina) AS maquinasComAlerta
        FROM maquina m
        JOIN historico h ON m.idMaquina = h.fkMaquina
        JOIN hardware hw ON h.fkHardware = hw.idHardware
        JOIN tipoHardware th ON hw.fkTipoHardware = th.idTipoHardware
        WHERE m.fkInstituicao = ${idInstituicao}
        AND DATE(h.dataHora) = CURDATE() 
        AND (
            (th.tipo = 'Processador' AND h.consumo > 70 AND h.idHistorico = (SELECT MAX(idHistorico) FROM historico WHERE fkMaquina = m.idMaquina AND tipo = 'Processador')) OR
            (th.tipo = 'RAM' AND h.consumo > 70 AND h.idHistorico = (SELECT MAX(idHistorico) FROM historico WHERE fkMaquina = m.idMaquina AND tipo = 'RAM')) OR
            (th.tipo = 'Disco' AND h.consumo > 70 AND h.idHistorico = (SELECT MAX(idHistorico) FROM historico WHERE fkMaquina = m.idMaquina AND tipo = 'Disco'))
        )
        ) AS maquinasComAlerta;
   
    `

    return database.executar(instrucao);
}

module.exports = {
    listar,
    listarSituacao,
    contadores,
    strikePMes,
    kpiInfos
};

// var database = require("../database/config");

// function listar(codInstituicao, texto) {
//     console.log('no model' + codInstituicao + texto);
//     var instrução = `
//     SELECT TOP 100 maq.nome AS nome,
//             CONVERT(VARCHAR, str.dataHora, 126) AS dataHora,
//         str.motivo AS motivo,
//         str.duracao AS duracao,
//         sit.situacao AS situacao
//         FROM strike AS str
//                   JOIN situacao AS sit ON sit.idSituacao = str.fkSituacao
//                   JOIN maquina AS maq ON maq.idMaquina = str.fkMaquina
//                         WHERE maq.fkInstituicao = ${codInstituicao} ${texto};
//     `;

//     console.log("Executando a instrução SQL: \n" + instrução);
//     return database.executar(instrução);
// }

// function listarSituacao(codInstituicao, situacao) {
//     console.log('no model');
//     var instrução = `
//     SELECT TOP 100 maq.nome AS nome,
//             CONVERT(VARCHAR, str.dataHora, 126) AS dataHora,
//         str.motivo AS motivo,
//         str.duracao AS duracao,
//         sit.situacao AS situacao
//         FROM strike AS str
//                   JOIN situacao AS sit ON sit.idSituacao = str.fkSituacao
//                   JOIN maquina AS maq ON maq.idMaquina = str.fkMaquina
//                         WHERE situacao = '${situacao}' AND maq.fkInstituicao = ${codInstituicao};
//     `;

//     console.log("Executando a instrução SQL: \n" + instrução);
//     return database.executar(instrução);
// }

// function contadores(codInstituicao) {
//     console.log('no model');
//     var instrução = `
//     SELECT COUNT(idStrike) as 'total',
//            COUNT(CASE WHEN fkSituacao = 1 THEN 1 END) as 'ativos',
//            COUNT(CASE WHEN fkSituacao = 2 THEN 1 END) as 'inativos',
//            COUNT(CASE WHEN fkSituacao = 3 THEN 1 END) as 'validos',
//            COUNT(CASE WHEN fkSituacao = 4 THEN 1 END) as 'invalidos' FROM strike
//                   JOIN maquina ON idMaquina = fkMaquina
//                         WHERE fkMaquina = ${codInstituicao};
//     `;

//     console.log("Executando a instrução SQL: \n" + instrução);
//     return database.executar(instrução);
// }

// function strikePMes(idInstituicao, qtdMes) {
//     console.log("Cheguei nomodel  STRIKE");

//     var instrucao = `
//     SELECT COUNT(*) AS strikes
//     FROM strike
//     JOIN maquina ON strike.fkMaquina = maquina.idMaquina
//     WHERE fkInstituicao = ${idInstituicao} AND MONTH(dataHora) = MONTH(GETDATE())
//     `;

//     console.log("Executando a instrucao SQL: \n" + instrucao);
//     return database.executar(instrucao);
// }

// function kpiInfos(idInstituicao){
//     var instrucao = `
//     SELECT
//         (SELECT COUNT(idStrike) FROM strike
//          JOIN maquina ON strike.fkMaquina = maquina.idMaquina
//          WHERE CAST(dataHora AS DATE) = CAST(GETDATE() AS DATE) AND fkInstituicao = ${idInstituicao}) as strikesNaSemana,

//         (SELECT COUNT(idHistorico) FROM historico
//          JOIN maquina ON historico.fkMaquina = maquina.idMaquina
//          WHERE CAST(dataHora AS DATE) = CAST(GETDATE() AS DATE) AND fkInstituicao = ${idInstituicao}) as alertasNaSemana,

//         (SELECT COUNT(DISTINCT m.idMaquina) AS totalMaquinas
//          FROM maquina m
//          WHERE m.fkInstituicao = ${idInstituicao}) AS totalMaquinas,

//         (SELECT COUNT(DISTINCT m.idMaquina) AS maquinasComStrike
//          FROM maquina m
//          JOIN strike s ON m.idMaquina = s.fkMaquina
//          WHERE CAST(s.dataHora AS DATE) = CAST(GETDATE() AS DATE) AND m.fkInstituicao = ${idInstituicao}) AS maquinasComStrike,

//         (SELECT COUNT(DISTINCT m.idMaquina) AS maquinasSemStrike
//         FROM maquina m
//         LEFT JOIN strike s ON m.idMaquina = s.fkMaquina AND CAST(s.dataHora AS DATE) = CAST(GETDATE() AS DATE)
//         WHERE s.fkMaquina IS NULL AND m.fkInstituicao = ${idInstituicao}) AS maquinasSemStrike,
       
//         (SELECT ROUND(COALESCE((COUNT(DISTINCT CASE WHEN s.idStrike IS NOT NULL AND CAST(s.dataHora AS DATE) = CAST(GETDATE() AS DATE) THEN m.idMaquina END) / COUNT(DISTINCT m.idMaquina)) * 100.0, 0), 1) AS porcetagemComStrike
//          FROM maquina m
//          LEFT JOIN strike s ON m.idMaquina = s.fkMaquina
//          WHERE m.fkInstituicao = ${idInstituicao}) AS porcentagemComStrike,
       
//          (SELECT COUNT(DISTINCT m.idMaquina) AS maquinasComAlerta
//          FROM maquina m
//          JOIN historico h ON m.idMaquina = h.fkMaquina
//          WHERE h.consumo > 80 AND CAST(h.dataHora AS DATE) = CAST(GETDATE() AS DATE) AND m.fkInstituicao = ${idInstituicao}) AS maquinasComAlerta,
       
//          (SELECT COUNT(DISTINCT m.idMaquina) AS maquinasSemAlerta
//          FROM maquina m
//          LEFT JOIN historico h ON m.idMaquina = h.fkMaquina AND CAST(h.dataHora AS DATE) = CAST(GETDATE() AS DATE)
//          WHERE h.fkMaquina IS NULL AND m.fkInstituicao = ${idInstituicao}) AS maquinasSemAlerta,
       
//          (SELECT ROUND(COALESCE((COUNT(DISTINCT CASE WHEN h.consumo > 80 AND CAST(h.dataHora AS DATE) = CAST(GETDATE() AS DATE) THEN m.idMaquina END) / COUNT(DISTINCT m.idMaquina)) * 100.0, 0), 1) AS porcentagemComAlerta
//          FROM maquina m
//          LEFT JOIN historico h ON m.idMaquina = h.fkMaquina
//          WHERE m.fkInstituicao = ${idInstituicao}) AS porcentagemComAlerta;
//     `;

//     return database.executar(instrucao);
// }

// module.exports = {
//     listar,
//     listarSituacao,
//     contadores,
//     strikePMes,
//     kpiInfos
// };
