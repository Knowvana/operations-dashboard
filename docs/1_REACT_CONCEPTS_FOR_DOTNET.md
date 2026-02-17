# React Concepts Explained (For .NET Developers)

This guide explains React concepts using C#/.NET parallels.

---

## 1. JSX - It's Like Embedded HTML

### React/JSX:
```javascript
function Header({ title, userCount }) {
    return (
        <header>
            <h1>{title}</h1>
            <span>Users: {userCount}</span>
        </header>
    );
}
```

### ASP.NET Razor equivalent:
```html
@{
    var title = ViewBag.Title;
    var userCount = ViewBag.UserCount;
}
<header>
    <h1>@title</h1>
    <span>Users: @userCount</span>
</header>
```

### What's happening:
- `<h1>{title}</h1>` is JavaScript inside HTML
- The `{}` means "insert JavaScript value here"
- Like `@title` in Razor

**Key difference:** JSX returns HTML that gets compiled to `React.createElement()` calls.

---

## 2. Components - Like UserControls

### React Component:
```javascript
function TaskCard({ task, onSelect }) {
    return (
        <div className="card" onClick={() => onSelect(task)}>
            <h3>{task.title}</h3>
            <p>{task.status}</p>
        </div>
    );
}

// Usage:
<TaskCard task={myTask} onSelect={handleSelect} />
```

### ASP.NET UserControl equivalent:
```csharp
// TaskCard.ascx
<%@ Control Language="C#" %>
<script runat="server">
    public Task Task { get; set; }
    public event EventHandler<EventArgs> TaskSelected;
    
    protected void Button_Click(object sender, EventArgs e)
    {
        TaskSelected?.Invoke(this, EventArgs.Empty);
    }
</script>

<div class="card" onclick="DoClick()">
    <h3><%= Task.Title %></h3>
    <p><%= Task.Status %></p>
</div>

// Usage in parent:
<%@ Register src="TaskCard.ascx" tagname="TaskCard" tagprefix="uc" %>
<uc:TaskCard Task="<%= myTask %>" OnTaskSelected="HandleSelect" />
```

### Key similarities:
| React | ASP.NET UserControl |
|-------|-------------------|
| **Props** | **Public Properties** |
| `<TaskCard task={t} />` | `<uc:TaskCard Task="t" />` |
| Passed data | Set property values |
| `onSelect` callback | Event handler |
| Read-only (props) | Read-write (properties) |

---

## 3. Props - Passing Data Down

### React:
```javascript
// Parent
const [userName, setUserName] = useState("Alice");

function Parent() {
    return <Child name={userName} age={25} />;
}

// Child receives props
function Child({ name, age }) {
    return <div>{name} is {age}</div>;
}
```

### ASP.NET (UserControl):
```csharp
// Parent.aspx
<%@ Register src="Child.ascx" tagname="Child" tagprefix="uc" %>

<script runat="server">
    string userNameValue = "Alice";
</script>

<uc:Child Name="<%= userNameValue %>" Age="25" />

// Child.ascx
<%@ Control Language="C#" %>
<script runat="server">
    public string Name { get; set; }
    public int Age { get; set; }
</script>

<div><%= Name %> is <%= Age %></div>
```

### Key point:
- Child receives data **in props** (read-only)
- Child **cannot** directly change props
- Child must call callback function if it needs to notify parent

**Rule:** Data flows **down** via props, updates flow **up** via callbacks.

---

## 4. State - Like Form Properties

### React (Functional Component with Hooks):
```javascript
function TaskForm() {
    const [status, setStatus] = useState("pending");
    const [comments, setComments] = useState("");
    
    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };
    
    return (
        <>
            <select value={status} onChange={handleStatusChange}>
                <option>pending</option>
                <option>completed</option>
            </select>
            
            <textarea 
                value={comments} 
                onChange={(e) => setComments(e.target.value)}
            />
        </>
    );
}
```

### ASP.NET WinForms equivalent:
```csharp
public partial class TaskForm : Form
{
    private string _status = "pending";
    private string _comments = "";
    
    public TaskForm()
    {
        InitializeComponent();
        statusDropdown.SelectedItem = _status;
        commentsTextBox.Text = _comments;
    }
    
    private void statusDropdown_SelectedIndexChanged(object sender, EventArgs e)
    {
        _status = statusDropdown.SelectedItem.ToString();
    }
    
    private void commentsTextBox_TextChanged(object sender, EventArgs e)
    {
        _comments = commentsTextBox.Text;
    }
}
```

### Concept mapping:

| React | WinForms |
|-------|----------|
| `useState("pending")` | Private field `_status = "pending"` |
| `[status, setStatus]` | `_status` (field) + setter method |
| `setStatus(newValue)` | `_status = newValue` then `Invalidate()` |
| Component re-renders | Form refreshes |
| `value={status}` | `Control.Text = _status` |

### Key insight - The Render Cycle:

**React:**
```
1. User types in input
2. onChange event fires
3. setState() called
4. Component re-renders (function runs again)
5. UI shows new value
```

**WinForms:**
```
1. User types in textbox
2. TextChanged event fires
3. Update field value: _status = value
4. Manually refresh() or Invalidate()
5. OnPaint() redraws UI
```

React automates steps 4-5 for you!

---

## 5. useEffect - Like Form_Load and Event Handlers

### React with useEffect:
```javascript
function TaskDashboard({ userId }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Runs when component mounts (like Form_Load)
    useEffect(() => {
        loadTasks();
    }, []);  // Empty dependency array = run once on mount
    
    // Runs when userId changes (like property setter handler)
    useEffect(() => {
        reloadTasksForUser();
    }, [userId]);  // Runs whenever userId changes
    
    async function loadTasks() {
        setLoading(true);
        const data = await fetchTasks();
        setTasks(data);
        setLoading(false);
    }
    
    if (loading) return <div>Loading...</div>;
    return <TaskList tasks={tasks} />;
}
```

### ASP.NET equivalent:
```csharp
public partial class TaskDashboard : UserControl
{
    private List<Task> _tasks = new List<Task>();
    private bool _loading = true;
    private int _userId;
    
    // Like Form_Load in WinForms
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            LoadTasks();
        }
    }
    
    public int UserId
    {
        get { return _userId; }
        set 
        { 
            _userId = value;
            ReloadTasksForUser();  // Like dependency change
        }
    }
    
    private void LoadTasks()
    {
        _loading = true;
        _tasks = TaskService.FetchTasks();
        _loading = false;
        Invalidate();  // Refresh UI
    }
    
    protected override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);
        if (_loading)
        {
            labelStatus.Text = "Loading...";
        }
        else
        {
            taskList.DataSource = _tasks;
        }
    }
}
```

### Mapping:

| React | ASP.NET |
|-------|---------|
| `useEffect(() => {...}, [])` | Field initialization + `Form_Load()` |
| `useEffect(() => {...}, [userId])` | Property setter + change handler |
| Dependency array `[userId]` | When to re-run (like when property changes) |
| Cleanup function | `Dispose()` for cleanup |

### Real-world example from our app:
```javascript
// When user is set (logged in), subscribe to tasks
useEffect(() => {
    if (!user) return;
    
    subscribeToTasks((fetchedTasks) => {
        setTasks(fetchedTasks);
        setIsLoading(false);
    });
}, [user]);  // Re-run when user changes

// Safety timeout - force UI display after 500ms
useEffect(() => {
    const timeout = setTimeout(() => {
        setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timeout);  // Cleanup
}, []);
```

---

## 6. Event Handling - Callbacks

### React:
```javascript
function TaskModal({ task, onUpdate, onClose }) {
    const [status, setStatus] = useState(task.status);
    
    const handleSave = () => {
        onUpdate(task.id, { status });  // Call parent function
        onClose();
    };
    
    return (
        <div>
            <select value={status} onChange={e => setStatus(e.target.value)}>
                <option>pending</option>
                <option>completed</option>
            </select>
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
}

// Usage:
<TaskModal 
    task={selectedTask}
    onUpdate={(id, updates) => updateTask(id, updates)}
    onClose={() => setSelectedTask(null)}
/>
```

### ASP.NET event equivalent:
```csharp
public partial class TaskModal : UserControl
{
    private string _status;
    
    // Events that parent subscribes to
    public event EventHandler<UpdateEventArgs> OnUpdate;
    public event EventHandler OnClose;
    
    protected void SaveButton_Click(object sender, EventArgs e)
    {
        var args = new UpdateEventArgs { TaskId = Task.Id, Status = _status };
        OnUpdate?.Invoke(this, args);
        OnClose?.Invoke(this, EventArgs.Empty);
    }
    
    protected void CancelButton_Click(object sender, EventArgs e)
    {
        OnClose?.Invoke(this, EventArgs.Empty);
    }
}

// Usage in parent:
var modal = new TaskModal();
modal.OnUpdate += (s, e) => UpdateTask(e.TaskId, e.Status);
modal.OnClose += (s, e) => HideModal();
```

### Concept:
| React | ASP.NET Events |
|-------|---|
| Pass functions as props | Subscribe to events |
| `onUpdate={(id) => ...}` | `modal.OnUpdate += (s, e) => ...` |
| Child calls `onUpdate()` | Child raises `OnUpdate?.Invoke()` |
| Parent responds | Parent's handler fires |

---

## 7. Conditional Rendering - Like if/else

### React:
```javascript
function Dashboard({ tasks, isLoading, isError }) {
    // Ternary operator
    if (isLoading) {
        return <div>Loading dashboard...</div>;
    }
    
    if (isError) {
        return <div className="error">Error loading tasks</div>;
    }
    
    // Render normally
    return (
        <>
            <ShiftDashboard tasks={tasks} />
            <TimelineView tasks={tasks} />
        </>
    );
}
```

### ASP.NET equivalent:
```html
<%@ Page Language="C#" %>
<script runat="server">
    bool isLoading;
    bool isError;
    List<Task> tasks;
    
    protected void Page_Load(object sender, EventArgs e)
    {
        // Load jobs
    }
</script>

<% if (isLoading) { %>
    <div>Loading dashboard...</div>
<% } else if (isError) { %>
    <div class="error">Error loading tasks</div>
<% } else { %>
    <uc:ShiftDashboard Tasks="<%= tasks %>" />
    <uc:TimelineView Tasks="<%= tasks %>" />
<% } %>
```

### Or using short-circuit evaluation:
```javascript
{isLoading && <div>Loading...</div>}
{!isLoading && <Dashboard data={data} />}
```

---

## 8. Lists - Rendering Multiple Items

### React:
```javascript
function TaskList({ tasks }) {
    return (
        <div>
            {tasks.map(task => (
                <TaskCard 
                    key={task.id}
                    task={task}
                />
            ))}
        </div>
    );
}
```

### ASP.NET Repeater:
```html
<%@ Page Language="C#" %>
<script runat="server">
    List<Task> tasks;
    
    protected void Page_Load(object sender, EventArgs e)
    {
        tasksRepeater.DataSource = tasks;
        tasksRepeater.DataBind();
    }
</script>

<asp:Repeater ID="tasksRepeater" runat="server">
    <ItemTemplate>
        <uc:TaskCard Task='<%# Eval("Task") %>' ID='<%# Eval("Id") %>' />
    </ItemTemplate>
</asp:Repeater>
```

### Key: The `key` attribute

**Always include `key` when rendering lists:**
```javascript
❌ Bad:
{tasks.map((task, index) => (
    <TaskCard key={index} task={task} />  // Never use index!
))}

✅ Good:
{tasks.map(task => (
    <TaskCard key={task.id} task={task} />  // Use unique ID
))}
```

Why? React uses `key` to track which item is which when list changes. If using index and you delete an item, React gets confused.

---

## 9. Two-Way Data Binding Pattern

### React (Controlled Input):
```javascript
function TaskForm() {
    const [title, setTitle] = useState("");
    
    return (
        <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />
    );
}
```

This is "controlled" - React controls the input value.

### ASP.NET Default (Uncontrolled):
```html
<input type="text" id="title" runat="server" />

<script runat="server">
    protected void SaveButton_Click(object sender, EventArgs e)
    {
        string title = title.Value;  // Read from DOM when needed
    }
</script>
```

This is "uncontrolled" - Input maintains its own value.

**React pattern is safer** because React always knows the value. ASP.NET requires you to read it when needed.

---

## 10. Local vs Global State

### React Local State (in our app):
```javascript
// Local to TimelineView
function TimelineView() {
    const [expandedId, setExpandedId] = useState(null);  // Just for this view
    
    return (
        <div>
            {tasks.map(task => (
                <TaskCard
                    isExpanded={expandedId === task.id}
                    onToggle={() => setExpandedId(
                        expandedId === task.id ? null : task.id
                    )}
                />
            ))}
        </div>
    );
}
```

### React Global State (in App.jsx):
```javascript
// Global - accessible to all components
function App() {
    const [tasks, setTasks] = useState([]);
    const [user, setUser] = useState(null);
    
    return (
        <>
            <Header user={user} />
            <ShiftDashboard tasks={tasks} />
            <TimelineView tasks={tasks} />
        </>
    );
}
```

### Rule of thumb:
- **Local state**: Used by only this component (like `expandedId`, `hoveredElement`)
- **Global state**: Used by multiple components (like `user`, `tasks`, `shifts`)

### ASP.NET parallel:
```csharp
// Local variable - just for this method
private void LoadForm()
{
    int tempId = 5;  // Not kept after method ends
}

// Private field - used throughout form class
private User _currentUser;  // Accessible in all methods
private List<Task> _tasks;

// Static - global (be careful!)
public static AppConfig Config;  // Available everywhere
```

---

## 11. Async/Await - Same as C#!

### React:
```javascript
async function loadTasks() {
    try {
        setIsLoading(true);
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        setTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        setError(error.message);
    } finally {
        setIsLoading(false);
    }
}
```

### C# equivalent:
```csharp
private async Task LoadTasks()
{
    try
    {
        IsLoading = true;
        var response = await httpClient.GetAsync("/api/tasks");
        var json = await response.Content.ReadAsStringAsync();
        Tasks = JsonConvert.DeserializeObject<List<Task>>(json);
    }
    catch (Exception error)
    {
        Console.WriteLine($"Error loading tasks: {error}");
        Error = error.Message;
    }
    finally
    {
        IsLoading = false;
    }
}
```

**They're nearly identical!** JavaScript async/await works the same as C#.

---

## 12. Destructuring - Unpacking Objects

### React:
```javascript
// Getting props
function Header({ userName, complianceStatus, onLogout }) {
    // Instead of: const props = {...}
    // We unpack directly in parameters
}

// Or unpacking state
const [loading, setLoading] = useState(true);
// Instead of: const result = useState(true)
// We get [value, setter] directly
```

### C# parameter unpacking (similar concept):
```csharp
public void ProcessUser((string name, int age) user)
{
    var (name, age) = user;  // Tuple deconstruction
    Console.WriteLine($"{name} is {age}");
}

// Or with objects - you'd do it manually:
public Header(HeaderProps props)
{
    var userName = props.UserName;
    var complianceStatus = props.ComplianceStatus;
    // React just does this automatically
}
```

---

## Summary: React vs ASP.NET Mapping

```
React                       | ASP.NET Equivalent
----------------------------|----------------------------------
Component                   | UserControl / Form class
Props                       | Public properties
State                       | Private fields + properties
Render cycle                | Control rendering + Invalidate()
useEffect                   | Form_Load + event handlers
onClick handler             | Button_Click event
onChange handler            | TextChanged event
Conditional rendering       | if/else in code-behind
map() for lists             | Repeater / DataBound control
Callback function prop      | Event + event handler
Data binding {{}}           | <%= value %>
CSS classes                 | CssClass property
fetch/async                 | HttpClient async
Firestore subscription      | Database change notification / polling
Virtual DOM                 | Control tree + dirty flag checking
Re-render on state change   | Invalidate() then OnPaint()
```

---

## Practice Question

When you see this React code:

```javascript
export function TaskForm({ taskId, onSave, onCancel }) {
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("pending");
    
    useEffect(() => {
        loadTask();
    }, [taskId]);
    
    async function loadTask() {
        const task = await fetchTask(taskId);
        setTitle(task.title);
        setStatus(task.status);
    }
    
    async function handleSave() {
        await updateTask(taskId, { title, status });
        onSave();
    }
    
    return (
        <div>
            <input value={title} onChange={e => setTitle(e.target.value)} />
            <select value={status} onChange={e => setStatus(e.target.value)}>
                <option>pending</option>
                <option>completed</option>
            </select>
            <button onClick={handleSave}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
}
```

**Try to translate it mentally to ASP.NET UserControl:**

<details>
<summary>Click to see solution</summary>

```csharp
public partial class TaskForm : UserControl
{
    // Props - public properties
    public int TaskId { get; set; }
    public event EventHandler OnSave;
    public event EventHandler OnCancel;
    
    // State - private fields
    private string _title = "";
    private string _status = "pending";
    
    // useEffect with [taskId] dependency
    public override void OnLoad(EventArgs e)
    {
        base.OnLoad(e);
        if (TaskId > 0)
        {
            LoadTask();
        }
    }
    
    // Also trigger when TaskId changes
    protected override void CreateChildControls()
    {
        base.CreateChildControls();
        // This re-creates controls if TaskId changed
        if (TaskId > 0)
        {
            LoadTask();
        }
    }
    
    // loadTask() - async function
    private async Task LoadTask()
    {
        var task = await FetchTask(TaskId);
        _title = task.Title;
        _status = task.Status;
        UpdateControls();
    }
    
    // Run async operation and update UI
    private void UpdateControls()
    {
        titleInput.Value = _title;
        statusDropdown.SelectedValue = _status;
    }
    
    // handleSave - button click handler
    protected void SaveButton_Click(object sender, EventArgs e)
    {
        _title = titleInput.Value;
        _status = statusDropdown.SelectedValue;
        
        UpdateTask(TaskId, new { Title = _title, Status = _status });
        OnSave?.Invoke(this, EventArgs.Empty);
    }
    
    protected void CancelButton_Click(object sender, EventArgs e)
    {
        OnCancel?.Invoke(this, EventArgs.Empty);
    }
}
```

See the parallels?

</details>

---

## Key Takeaways

1. **Components = UserControls** - Reusable pieces
2. **Props = public properties** - Pass data down
3. **State = private fields + setter** - Component's local data
4. **useEffect = Form_Load + events** - Side effects
5. **Callbacks = events** - Child → Parent communication
6. **JSX = Razor views** - HTML + dynamic values
7. **async/await = same in both** - Identical!
8. **Rendering = auto-refresh** - React refreshes when state changes
9. **Local state** - Use it for form fields
10. **Global state** - Use it for data shared between components

**Read these concepts, then look at actual code to SEE them in practice!** 🎯
