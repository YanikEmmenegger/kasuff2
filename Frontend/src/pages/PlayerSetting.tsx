import AvatarBuilder from "../components/avatar/AvatarBuilder.tsx";
import ChangeNameForm from "../components/ChangeNameForm.tsx"; // Import the new ChangeNameForm component

const PlayerSetting = () => {
    return (
        <div
            className="w-screen min-h-screen h-auto flex flex-col justify-start items-center pt-40 gap-10">
            <h1 className="text-4xl font-bold text-white mb-8">Profile Settings</h1>

            {/* Avatar Builder */}
            <div className="mb-8">
                <AvatarBuilder/>
            </div>

            {/* Name Change Form */}
            <ChangeNameForm/>
        </div>
    );
};

export default PlayerSetting;
