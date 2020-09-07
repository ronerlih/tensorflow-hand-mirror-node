export default function setupDatGui(state, renderPointcloud) {
   const gui = new dat.GUI();
 
   if (renderPointcloud) {
     gui.add(state, 'renderPointcloud').onChange(render => {
       document.querySelector('#scatter-gl-container').style.display =
         render ? 'inline-block' : 'none';
     });
   }
   console.log(state);
   gui.add(state, 'confidence', 0, 1).onChange(res => {
      console.log(res);
    });
 }