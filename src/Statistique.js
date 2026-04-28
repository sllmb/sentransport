import './Statistique.css';

function Statistique({chiffre, libelle})
{
    return(
        <p className='stat'>{chiffre} {libelle}</p>
    );
}

export default Statistique;