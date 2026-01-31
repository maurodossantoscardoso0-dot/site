
const reveals=document.querySelectorAll('.reveal');

const observer=new IntersectionObserver(entries=>{
 entries.forEach(entry=>{
  if(entry.isIntersecting){
    entry.target.classList.add('active');
  }
 });
},{threshold:0.2});

reveals.forEach(r=>observer.observe(r));

function scrollTo(servicos){
 document.getElementById(servicos).scrollIntoView({behavior:'smooth'});
}
