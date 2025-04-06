import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="py-16 bg-background border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <BrandLogo width={150} height={40} />
            </h3>
            <p className="text-gray-400 mt-2">
              Votre partenaire musical professionnel
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <h4 className="text-white font-medium mb-3">Contact</h4>
              <p className="text-gray-400">contact@kasarstudio.fr</p>
              <p className="text-gray-400">+33 1 23 45 67 89</p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Adresse</h4>
              <p className="text-gray-400">Villeurbanne, secteur Charpennes</p>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Horaires</h4>
              <p className="text-gray-400">Lun - Sam: 10h - 22h</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Kasar Studio. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
