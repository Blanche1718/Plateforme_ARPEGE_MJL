const cron = require('node-cron');
const db = require("../models/index");
const tasks = require('./tasks')
const { Op } = require('sequelize');


// Récupérer les jobs planifiés depuis PostgreSQL
async function getScheduledJobs() {
  try {
    console.log('Getting tasks')
    const tasks = await db.ScheduledTasks.findAll({
        where: {
            scheduled_time: {
                [Op.lte]: new Date() // Opérateur "moins que ou égal à"
            },
            status: 'pending' // Vérifier que le statut est vide
        }
    });
    console.log('Tasks: ', tasks)
    return tasks;
  } catch (err) {
    console.error('Erreur lors de la récupération des jobs:', err);
    return [];
  }
}

// Marquer un job comme terminé
async function markJobAsCompleted(jobId) {
  try {
    const job = await db.ScheduledTasks.findOne({where: {id: jobId}})
    job.status = 'done'
    await job.save()
    console.log(`Job ${jobId} marqué comme terminé`);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du job:', err);
  }
}

// Planifier et exécuter les jobs
async function scheduleJobs() {
    console.log("lancement du tack scheduler")
  // Définir les règles de cron pour chaque type de job
  // let cronTime = '* * * * *'; // Exemple : chaque minute
  let cronTime = '*/10 * * * *'; // Chaque 5 minutes
  // Planifier l'exécution du job avec node-cron
  cron.schedule(cronTime, async () => {
    console.log("Scheduling and executing jobs")
    const jobs = await getScheduledJobs();
    jobs.forEach(async (job) => {
        console.log("Checking tasks for execution .....")
        const now = new Date();
        const jobTime = new Date(job.scheduled_time);
        let params = null;
        let resp = null;
        console.log("Job: ", job.code, now >= jobTime);
        if (now >= jobTime) {
            console.log(`Executing job: ${job.code}`, job.done == true);
            if(job.done == true){
              //Destroy job
              await db.ScheduledTasks.destroy({
                where: { id: job.id }
              });
              return
            }
            // Exécution du job en fonction du type
            switch (job.code) {
                case 'work_test':
                    await tasks.worktest(job)
                    await markJobAsCompleted(job.id);
                    break;
                case 'delete_code_otp':
                    params = JSON.parse(job.params)
                    resp = await tasks.deleteCodeOTP(params.codeId)
                    if(resp) await markJobAsCompleted(job.id);
                    params = null
                    resp = null
                    break;
                case 'del_doc':
                    params = JSON.parse(job.params)
                    resp = await tasks.deleteDocument(params.id)
                    if(resp) await markJobAsCompleted(job.id);
                    params = null
                    resp = null
                    break;
                case 'auto_sign_post_presence':
                    params = JSON.parse(job.params)
                    resp = await tasks.signPresenceCertificateAutomatically(params.requestId, params.userId)
                    if(resp) await markJobAsCompleted(job.id);
                    params = null
                    resp = null
                    break;
                default:
                    console.log(`Aucun job trouvé pour : ${job.libelle}`);
            }
        }else{
            console.log("No tasks for execution .....")
        }
    });
    
  });
  
}

// Exemple d'ajout de jobs dans la base de données
async function addJob(libelle,code,  scheduled_time, params = {}) {
  try {
    await db.ScheduledTasks.create({
        libelle,
        code,
        scheduled_time,
        params: JSON.stringify(params)  
    })
    console.log(`Job '${libelle}' ajouté avec succès pour ${scheduled_time}`);
  } catch (err) {
    console.error('Erreur lors de l\'ajout du job:', err);
  }
}


// Exporter les fonctions
module.exports = {
    addJob,
    scheduleJobs
};