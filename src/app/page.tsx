
import Modal from "@/comps/Modal";



export default function Home() {
  const activateModal = process.env.ACTIVATE_MODAL === "false" ? false : true;
  return (
    <div >
      <main className="w-full h-full p-4">
        <h1>HOME PAGE</h1>
      </main>


      { activateModal && (
        <Modal>
          <h2 className="text-2xl font-bold mb-4">Modal Title</h2>
          <p>Hello!</p>
        </Modal>
      )}

    </div>
  );
}
  