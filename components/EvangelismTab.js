// ================================================================
// SNIPPET 1 — Add import at top of dashboard/index.js
// ================================================================
import EvangelismTab from '../../components/EvangelismTab';


// ================================================================
// SNIPPET 2 — Add evangelism tab to bottom navigation
// Place it after the profile button, before the IT Admin block
// Accessible to: Secretary and Senior Commander I only
// ================================================================
{
    (member?.role === 'Secretary' || member?.role === 'Senior Commander I') && (
        <button
            onClick={() => setActiveTab('evangelism')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition ${activeTab === 'evangelism' ? 'bg-red-50 text-red-600' : 'text-gray-500'
                }`}
        >
            <span className="text-xl">✝️</span>
            <span className="text-xs mt-1 font-medium">Evangelism</span>
        </button>
    )
}


// ================================================================
// SNIPPET 3 — Add tab render in main content area
// Place with the other activeTab checks
// ================================================================
{
    activeTab === 'evangelism' && (
        member?.role === 'Secretary' || member?.role === 'Senior Commander I'
    ) && <EvangelismTab member={member} />
}