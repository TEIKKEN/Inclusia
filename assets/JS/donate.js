const donateBtn = document.querySelector("#donate-btn");

if (donateBtn) {
  donateBtn.addEventListener("click", () => {
    alert(
      "INCLUSIA está en sus inicios 💙\n\n" +
      "Tu apoyo nos ayudará a crear espacios más accesibles, " +
      "buscar aliados y hacer este proyecto tan grande como debe ser."
    );
  });
}
