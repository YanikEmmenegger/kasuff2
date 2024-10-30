import ChangeNameForm from "../components/player/ChangeNameForm.tsx";
import AvatarBuilder from "../components/avatar/AvatarBuilder.tsx";

const PlayerSetting = () => {


    return (
        <div
            className="w-screen min-h-screen h-auto flex flex-col justify-start items-center pt-40 gap-10">
            <ChangeNameForm/>
            <AvatarBuilder/>
        </div>
    )


};

export default PlayerSetting;


/*
*/

